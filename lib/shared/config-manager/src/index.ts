import { ConfigBody, DVCLogger } from '@devcycle/types'
import { getEnvironmentConfig, isValidDate } from './request'
import { ResponseError, UserError } from '@devcycle/server-request'
import { SSEConnection } from '@devcycle/sse-connection'

type ConfigPollingOptions = {
    configPollingIntervalMS?: number
    sseConfigPollingIntervalMS?: number
    configPollingTimeoutMS?: number
    configCDNURI?: string
    cdnURI?: string
    clientMode?: boolean
    enableBetaRealTimeUpdates?: boolean
}

type SetIntervalInterface = (handler: () => void, timeout?: number) => any
type ClearIntervalInterface = (intervalTimeout: any) => void
type SetConfigBufferInterface = (sdkKey: string, projectConfig: string) => void
type TrackSDKConfigEventInterface = (
    url: string,
    responseTimeMS: number,
    res?: Response,
    err?: ResponseError,
    reqEtag?: string,
    reqLastModified?: string,
    sseConnected?: boolean,
) => void

export abstract class ConfigSource {
    abstract getConfig(
        sdkKey: string,
        currentEtag?: string,
        currentLastModified?: string,
        lastModifiedThreshold?: string,
    ): Promise<ConfigBody>
}

export class DefaultConfigSource implements ConfigSource {
    configEtag?: string
    configLastModified?: string

    constructor(
        private cdnURI: string,
        private clientMode: boolean,
        private logger: DVCLogger,
        private requestTimeoutMS: number,
    ) {}

    async getConfig(
        sdkKey: string,
        currentEtag?: string,
        currentLastModified?: string,
        lastModifiedThreshold?: string,
    ): Promise<ConfigBody> {
        const res = await getEnvironmentConfig({
            logger: this.logger,
            url: this.getConfigURL(sdkKey),
            requestTimeout: this.requestTimeoutMS,
            currentEtag,
            currentLastModified,
            sseLastModified: lastModifiedThreshold,
        })

        const projectConfig = await res.text()

        this.logger.debug(
            `Downloaded config, status: ${
                res?.status
            }, etag: ${res?.headers.get('etag')}`,
        )

        if (res?.status === 304) {
            this.logger.debug(
                `Config not modified, using cache, etag: ${this.configEtag}` +
                    `, last-modified: ${this.configLastModified}`,
            )
        } else if (res?.status === 200 && projectConfig) {
            const lastModifiedHeader = res?.headers.get('last-modified')
            if (this.isLastModifiedHeaderOld(lastModifiedHeader)) {
                this.logger.debug(
                    'Skipping saving config, existing last modified date is newer.',
                )
            }

            this.configEtag = res?.headers.get('etag') || ''
            this.configLastModified = lastModifiedHeader || ''
        }
    }

    getConfigURL(sdkKey: string): string {
        if (this.clientMode) {
            return `${this.cdnURI}/config/v1/server/bootstrap/${sdkKey}.json`
        }
        return `${this.cdnURI}/config/v1/server/${sdkKey}.json`
    }

    private isLastModifiedHeaderOld(lastModifiedHeader: string | null) {
        const lastModifiedHeaderDate = lastModifiedHeader
            ? new Date(lastModifiedHeader)
            : null
        const configLastModifiedDate = this.configLastModified
            ? new Date(this.configLastModified)
            : null

        return (
            isValidDate(configLastModifiedDate) &&
            isValidDate(lastModifiedHeaderDate) &&
            lastModifiedHeaderDate <= configLastModifiedDate
        )
    }
}

export class EnvironmentConfigManager {
    private _hasConfig = false
    configEtag?: string
    configLastModified?: string
    configSSE?: ConfigBody<string>['sse']

    private currentPollingInterval: number
    private readonly configPollingIntervalMS: number
    private readonly sseConfigPollingIntervalMS: number
    private readonly requestTimeoutMS: number
    private readonly cdnURI: string
    private readonly enableRealtimeUpdates: boolean

    fetchConfigPromise: Promise<void>
    private intervalTimeout?: any
    private clientMode: boolean
    private sseConnection?: SSEConnection

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
            configCDNURI,
            cdnURI = 'https://config-cdn.devcycle.com',
            clientMode = false,
            enableBetaRealTimeUpdates = false,
        }: ConfigPollingOptions,
        private configSource: ConfigSource = new DefaultConfigSource(
            cdnURI,
            clientMode,
            logger,
            configPollingTimeoutMS,
        ),
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
        this.cdnURI = configCDNURI || cdnURI

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

    private stopPolling(): void {
        this.clearInterval(this.intervalTimeout)
        this.intervalTimeout = null
    }

    cleanup(): void {
        this.stopPolling()
        this.stopSSE()
    }

    getConfigURL(): string {
        if (this.clientMode) {
            return `${this.cdnURI}/config/v1/server/bootstrap/${this.sdkKey}.json`
        }
        return `${this.cdnURI}/config/v1/server/${this.sdkKey}.json`
    }

    async _fetchConfig(sseLastModified?: string): Promise<void> {
        const url = this.getConfigURL()
        let res: Response | null
        let projectConfig: ConfigBody | null = null
        let responseError: ResponseError | null = null
        const startTime = Date.now()
        let responseTimeMS = 0
        const currentEtag = this.configEtag
        const currentLastModified = this.configLastModified

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
            if ((res && res?.status !== 304) || err) {
                this.trackSDKConfigEvent(
                    url,
                    responseTimeMS,
                    res || undefined,
                    err,
                    currentEtag,
                    currentLastModified,
                    this.sseConnection?.isConnected() ?? false,
                )
            }
        }

        try {
            this.logger.debug(
                `Requesting new config for ${url}, etag: ${this.configEtag}` +
                    `, last-modified: ${this.configLastModified}`,
            )
            projectConfig = await this.configSource.getConfig(
                this.sdkKey,
                currentEtag,
                currentLastModified,
                sseLastModified,
            )
            responseTimeMS = Date.now() - startTime
        } catch (ex) {
            if (this.hasConfig) {
                // TODO currently event queue in WASM requires a valid config
                // switch this to hit the events API directly
                trackEvent(ex)
            }
            logError(ex)
            res = null
            if (ex instanceof ResponseError) {
                responseError = ex
            }
        }

        if (res?.status === 304) {
            this.handleSSEConfig()
            return
        } else if (res?.status === 200 && projectConfig) {
            try {
                this.handleSSEConfig(projectConfig)

                this.setConfigBuffer(
                    `${this.sdkKey}${this.clientMode ? '_client' : ''}`,
                    projectConfig,
                )
                this._hasConfig = true
                return
            } catch (e) {
                logError(new Error('Invalid config JSON.'))
                res = null
            } finally {
                trackEvent()
            }
        }

        if (this._hasConfig) {
            this.logger.warn(
                `Failed to download config, using cached version. url: ${url}.`,
            )
        } else if (responseError?.status === 403) {
            this.cleanup()
            throw new UserError(`Invalid SDK key provided: ${this.sdkKey}`)
        } else {
            throw new Error('Failed to download DevCycle config.')
        }
    }

    private handleSSEConfig(projectConfig?: string) {
        if (this.enableRealtimeUpdates) {
            const originalConfigSSE = this.configSSE
            if (projectConfig) {
                const configBody = JSON.parse(
                    projectConfig,
                ) as ConfigBody<string>
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
