import { ConfigBody, DVCLogger } from '@devcycle/types'
import { getEnvironmentConfig } from './request'
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
) => void

const isValidDate = (date: Date | null): date is Date =>
    date instanceof Date && !isNaN(date.getTime())

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
            const parsedMessage = JSON.parse(message as string)
            const messageData = JSON.parse(parsedMessage.data)

            if (
                !messageData ||
                !(!messageData.type || messageData.type === 'refetchConfig')
            ) {
                return
            }
            if (this.configEtag && messageData.etag === this.configEtag) {
                return
            }

            if (this.isLastModifiedHeaderOld(messageData.lastModified)) {
                this.logger.debug(
                    'Skipping SSE message, config last modified is newer. ',
                )
                return
            }

            this._fetchConfig()
                .then(() => {
                    this.logger.debug('Config re-fetched from SSE message')
                })
                .catch((e) => {
                    this.logger.warn(
                        `Failed to re-fetch config from SSE Message: ${e}`,
                    )
                })
        } catch (e) {
            this.logger.warn(
                `Streaming Connection: Unparseable message. Error: ${e}, message: ${message}`,
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
        if (
            this.intervalTimeout &&
            pollingInterval !== this.currentPollingInterval
        ) {
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
        this.disablePolling = true
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

    async _fetchConfig(): Promise<void> {
        const url = this.getConfigURL()
        let res: Response | null
        let projectConfig: string | null = null
        let responseError: ResponseError | null = null
        const startTime = Date.now()
        let responseTimeMS = 0
        const reqEtag = this.configEtag
        const reqLastModified = this.configLastModified

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
                    reqEtag,
                    reqLastModified,
                )
            }
        }

        try {
            this.logger.debug(
                `Requesting new config for ${url}, etag: ${this.configEtag}` +
                    `, last-modified: ${this.configLastModified}`,
            )
            res = await getEnvironmentConfig(
                url,
                this.requestTimeoutMS,
                reqEtag,
                reqLastModified,
            )
            responseTimeMS = Date.now() - startTime
            projectConfig = await res.text()
            this.logger.debug(
                `Downloaded config, status: ${
                    res?.status
                }, etag: ${res?.headers.get('etag')}`,
            )
        } catch (ex) {
            trackEvent(ex)
            logError(ex)
            res = null
            if (ex instanceof ResponseError) {
                responseError = ex
            }
        }

        if (res?.status === 304) {
            this.logger.debug(
                `Config not modified, using cache, etag: ${this.configEtag}` +
                    `, last-modified: ${this.configLastModified}`,
            )
            return
        } else if (res?.status === 200 && projectConfig) {
            const lastModifiedHeader = res?.headers.get('last-modified')
            if (this.isLastModifiedHeaderOld(lastModifiedHeader)) {
                this.logger.warn(
                    'Skipping saving config, existing last modified date is newer.',
                )
                return
            }

            try {
                this.handleSSEConfig(projectConfig)

                this.setConfigBuffer(
                    `${this.sdkKey}${this.clientMode ? '_client' : ''}`,
                    projectConfig,
                )
                this._hasConfig = true
                this.configEtag = res?.headers.get('etag') || ''
                this.configLastModified = lastModifiedHeader || ''
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

    private handleSSEConfig(projectConfig: string) {
        if (this.enableRealtimeUpdates) {
            const configBody = JSON.parse(projectConfig) as ConfigBody<string>
            const originalConfigSSE = this.configSSE
            this.configSSE = configBody.sse

            // Reconnect SSE if not first config fetch, and the SSE config has changed
            if (
                this.hasConfig &&
                (!originalConfigSSE ||
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
