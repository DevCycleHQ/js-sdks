import { ConfigBody, DVCLogger } from '@devcycle/types'
import { ResponseError, UserError } from '@devcycle/server-request'
import { SSEConnection } from '@devcycle/sse-connection'
import { CDNConfigSource } from './CDNConfigSource'
import { isValidDate } from './request'
import { ConfigSource } from './ConfigSource'

export * from './ConfigSource'

type ConfigPollingOptions = {
    configPollingIntervalMS?: number
    sseConfigPollingIntervalMS?: number
    configPollingTimeoutMS?: number
    configCDNURI?: string
    clientMode?: boolean
    enableBetaRealTimeUpdates?: boolean
}

type SetIntervalInterface = (handler: () => void, timeout?: number) => any
type ClearIntervalInterface = (intervalTimeout: any) => void
type SetConfigBufferInterface = (sdkKey: string, projectConfig: string) => void
type TrackSDKConfigEventInterface = (
    url: string,
    responseTimeMS: number,
    retrievalMetadata?: Record<string, unknown>,
    err?: ResponseError,
    reqEtag?: string,
    reqLastModified?: string,
    sseConnected?: boolean,
) => void

export class EnvironmentConfigManager {
    private _hasConfig = false
    configSSE?: ConfigBody<string>['sse']

    private currentPollingInterval: number
    private readonly configPollingIntervalMS: number
    private readonly sseConfigPollingIntervalMS: number
    private readonly enableRealtimeUpdates: boolean

    fetchConfigPromise: Promise<void>
    private intervalTimeout?: any
    private clientMode: boolean
    private sseConnection?: SSEConnection
    private readonly requestTimeoutMS: number
    private configSource: ConfigSource

    constructor(
        private readonly logger: DVCLogger,
        private readonly sdkKey: string,
        private readonly setConfigBuffer: SetConfigBufferInterface,
        private readonly setInterval: SetIntervalInterface,
        private readonly clearInterval: ClearIntervalInterface,
        private readonly trackSDKConfigEvent: TrackSDKConfigEventInterface,
        {
            configPollingIntervalMS = 10000,
            sseConfigPollingIntervalMS = 10 * 60 * 1000, // 10 minutes
            configPollingTimeoutMS = 5000,
            configCDNURI = 'https://config-cdn.devcycle.com',
            clientMode = false,
            enableBetaRealTimeUpdates = false,
        }: ConfigPollingOptions,
        configSource?: ConfigSource,
    ) {
        this.clientMode = clientMode
        this.enableRealtimeUpdates = enableBetaRealTimeUpdates

        this.configPollingIntervalMS =
            configPollingIntervalMS >= 1000 ? configPollingIntervalMS : 1000
        this.sseConfigPollingIntervalMS =
            sseConfigPollingIntervalMS <= 60 * 1000
                ? 10 * 60 * 1000
                : sseConfigPollingIntervalMS
        this.requestTimeoutMS =
            configPollingTimeoutMS >= this.configPollingIntervalMS
                ? this.configPollingIntervalMS
                : configPollingTimeoutMS

        this.configSource =
            configSource ??
            new CDNConfigSource(configCDNURI, logger, this.requestTimeoutMS)

        this.fetchConfigPromise = this._fetchConfig()
            .then(() => {
                this.logger.debug('DevCycle initial config loaded')
            })
            .finally(() => {
                this.startPolling(this.configPollingIntervalMS)
                this.startSSE()
            })
    }

    private startSSE(): void {
        if (!this.enableRealtimeUpdates) return

        if (!this.configSSE) {
            this.logger.warn('No SSE configuration found')
            return
        }
        if (this.sseConnection) {
            return
        }

        const url = new URL(
            this.configSSE.path,
            this.configSSE.hostname,
        ).toString()
        this.logger.debug(`Starting SSE connection to ${url}`)

        this.sseConnection = new SSEConnection(url, this.logger, {
            onMessage: this.onSSEMessage.bind(this),
            onOpen: () => {
                this.logger.debug('SSE connection opened')
                // Set config polling interval to 10 minutes
                this.startPolling(this.sseConfigPollingIntervalMS)
            },
            onConnectionError: () => {
                this.logger.debug('SSE connection error, switching to polling')
                // reset polling interval to default
                this.startPolling(this.configPollingIntervalMS)
                this.stopSSE()
            },
        })
    }

    private onSSEMessage(message: string): void {
        this.logger.debug(`SSE message: ${message}`)
        try {
            const parsedMessage = JSON.parse(message)
            const messageData = JSON.parse(parsedMessage.data)
            if (!messageData) return
            const { type, etag, lastModified } = messageData

            if (!(!type || type === 'refetchConfig')) {
                return
            }
            if (this.configEtag && etag === this.configEtag) {
                return
            }

            if (this.isLastModifiedHeaderOld(lastModified)) {
                this.logger.debug(
                    'Skipping SSE message, config last modified is newer. ',
                )
                return
            }

            this._fetchConfig(lastModified)
                .then(() => {
                    this.logger.debug('Config re-fetched from SSE message')
                })
                .catch((e: unknown) => {
                    this.logger.warn(
                        `Failed to re-fetch config from SSE Message: ${e}`,
                    )
                })
        } catch (e) {
            this.logger.debug(
                `SSE Message Error: Unparseable message. Error: ${e}, message: ${message}`,
            )
        }
    }

    private stopSSE(): void {
        if (this.sseConnection) {
            this.sseConnection.close()
            this.sseConnection = undefined
        }
    }

    private startPolling(pollingInterval: number): void {
        if (this.intervalTimeout) {
            if (pollingInterval === this.currentPollingInterval) {
                return
            }
            // clear existing polling interval
            this.stopPolling()
        }

        this.intervalTimeout = this.setInterval(async () => {
            try {
                await this._fetchConfig()
            } catch (ex) {
                this.logger.error((ex as Error).message)
            }
        }, pollingInterval)
        this.currentPollingInterval = pollingInterval
    }

    get hasConfig(): boolean {
        return this._hasConfig
    }

    get configEtag(): string | undefined {
        return this.configSource.configEtag
    }

    private stopPolling(): void {
        this.clearInterval(this.intervalTimeout)
        this.intervalTimeout = null
    }

    cleanup(): void {
        this.stopPolling()
        this.stopSSE()
    }

    async _fetchConfig(sseLastModified?: string): Promise<void> {
        const url = this.configSource.getConfigURL(
            this.sdkKey,
            this.clientMode ? 'bootstrap' : 'server',
            false,
        )
        let projectConfig: ConfigBody | null = null
        let retrievalMetadata: Record<string, unknown>
        const startTime = Date.now()
        let responseTimeMS = 0

        const currentEtag = this.configSource.configEtag
        const currentLastModified = this.configSource.configLastModified

        const logError = (error: any) => {
            const errMsg =
                `Request to get config failed for url: ${url}, ` +
                `response message: ${error.message}, response data: ${projectConfig}`
            if (this._hasConfig) {
                this.logger.warn(errMsg)
            } else {
                this.logger.error(errMsg)
            }
        }

        const trackEvent = (err?: ResponseError) => {
            if (projectConfig || err) {
                this.trackSDKConfigEvent(
                    url,
                    responseTimeMS,
                    retrievalMetadata,
                    err,
                    currentEtag,
                    currentLastModified,
                    this.sseConnection?.isConnected() ?? false,
                )
            }
        }

        try {
            this.logger.debug(
                `Requesting new config for ${url}, etag: ${this.configSource.configEtag}` +
                    `, last-modified: ${this.configSource.configLastModified}`,
            )
            ;({ config: projectConfig, metaData: retrievalMetadata } =
                await this.configSource.getConfig(
                    this.sdkKey,
                    this.clientMode ? 'bootstrap' : 'server',
                    false,
                    sseLastModified,
                ))
            responseTimeMS = Date.now() - startTime
            // if no errors occurred, the projectConfig is either new or null (meaning cached version is used)
            // either way, trigger the SSE config handler to see if we need to reconnect
            this.handleSSEConfig(projectConfig ?? undefined)
        } catch (ex) {
            if (this.hasConfig) {
                // TODO currently event queue in WASM requires a valid config
                // switch this to hit the events API directly
                trackEvent(ex)
            }
            logError(ex)
            if (ex instanceof UserError) {
                this.cleanup()
                throw ex
            } else if (this._hasConfig) {
                this.logger.warn(
                    `Failed to download config, using cached version. url: ${url}.`,
                )
            }
        }

        if (projectConfig) {
            try {
                this.setConfigBuffer(
                    `${this.sdkKey}${this.clientMode ? '_client' : ''}`,
                    JSON.stringify(projectConfig),
                )
                this._hasConfig = true
                return
            } catch (e) {
                logError(new Error('Invalid config JSON.'))
            } finally {
                trackEvent()
            }
        }

        if (!this._hasConfig) {
            throw new Error('Failed to download DevCycle config.')
        }
    }

    private isLastModifiedHeaderOld(lastModifiedHeader: string | null) {
        const lastModifiedHeaderDate = lastModifiedHeader
            ? new Date(lastModifiedHeader)
            : null
        const configLastModifiedDate = this.configSource.configLastModified
            ? new Date(this.configSource.configLastModified)
            : null

        return (
            isValidDate(configLastModifiedDate) &&
            isValidDate(lastModifiedHeaderDate) &&
            lastModifiedHeaderDate <= configLastModifiedDate
        )
    }

    private handleSSEConfig(configBody?: ConfigBody<string>) {
        if (this.enableRealtimeUpdates) {
            const originalConfigSSE = this.configSSE
            if (configBody) {
                this.configSSE = configBody.sse
            }

            // Reconnect SSE if not first config fetch, and the SSE config has changed
            if (
                this.hasConfig &&
                (!originalConfigSSE ||
                    !this.sseConnection ||
                    originalConfigSSE.hostname !== this.configSSE?.hostname ||
                    originalConfigSSE.path !== this.configSSE?.path)
            ) {
                this.stopSSE()
                this.startSSE()
            }
        } else {
            this.configSSE = undefined
            this.stopSSE()
        }
    }
}
