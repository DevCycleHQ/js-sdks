import { DVCLogger } from '@devcycle/types'
import { getEnvironmentConfig } from './request'
import { ResponseError, UserError } from '@devcycle/server-request'

type ConfigPollingOptions = {
    configPollingIntervalMS?: number
    configPollingTimeoutMS?: number
    configCDNURI?: string
    cdnURI?: string
    clientConfig?: boolean
}

type SetIntervalInterface = (handler: () => void, timeout?: number) => any
type ClearIntervalInterface = (intervalTimeout: any) => void

type SetConfigBuffer = (sdkKey: string, projectConfig: string) => void

export class EnvironmentConfigManager {
    private readonly logger: DVCLogger
    private readonly sdkKey: string
    private hasConfig = false
    configEtag?: string
    configLastModified?: string
    private readonly pollingIntervalMS: number
    private readonly requestTimeoutMS: number
    private readonly cdnURI: string
    fetchConfigPromise: Promise<void>
    private intervalTimeout?: any
    private disablePolling = false
    private readonly setConfigBuffer: SetConfigBuffer
    private readonly setInterval: SetIntervalInterface
    private readonly clearInterval: ClearIntervalInterface
    private clientConfig: boolean

    constructor(
        logger: DVCLogger,
        sdkKey: string,
        setConfigBuffer: SetConfigBuffer,
        setInterval: SetIntervalInterface,
        clearInterval: ClearIntervalInterface,
        {
            configPollingIntervalMS = 10000,
            configPollingTimeoutMS = 5000,
            configCDNURI,
            cdnURI = 'https://config-cdn.devcycle.com',
            clientConfig = false,
        }: ConfigPollingOptions,
    ) {
        this.logger = logger
        this.sdkKey = sdkKey

        this.setConfigBuffer = setConfigBuffer
        this.setInterval = setInterval
        this.clearInterval = clearInterval
        this.clientConfig = clientConfig

        this.pollingIntervalMS =
            configPollingIntervalMS >= 1000 ? configPollingIntervalMS : 1000
        this.requestTimeoutMS =
            configPollingTimeoutMS >= this.pollingIntervalMS
                ? this.pollingIntervalMS
                : configPollingTimeoutMS
        this.cdnURI = configCDNURI || cdnURI

        this.fetchConfigPromise = this._fetchConfig()
            .then(() => {
                this.logger.debug('DevCycle initial config loaded')
            })
            .finally(() => {
                if (this.disablePolling) {
                    return
                }
                this.intervalTimeout = this.setInterval(async () => {
                    try {
                        await this._fetchConfig()
                    } catch (ex) {
                        this.logger.error((ex as Error).message)
                    }
                }, this.pollingIntervalMS)
            })
    }

    stopPolling(): void {
        this.disablePolling = true
        this.clearInterval(this.intervalTimeout)
    }

    cleanup(): void {
        this.stopPolling()
    }

    getConfigURL(): string {
        if (this.clientConfig) {
            return `${this.cdnURI}/config/v1/client/${this.sdkKey}.json`
        }
        return `${this.cdnURI}/config/v1/server/${this.sdkKey}.json`
    }

    async _fetchConfig(): Promise<void> {
        const url = this.getConfigURL()
        let res: Response | null
        let projectConfig: string | null = null
        let responseError: ResponseError | null = null

        const logError = (error: any) => {
            const errMsg =
                `Request to get config failed for url: ${url}, ` +
                `response message: ${error.message}, response data: ${projectConfig}`
            if (this.hasConfig) {
                this.logger.warn(errMsg)
            } else {
                this.logger.error(errMsg)
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
                this.configEtag,
                this.configLastModified,
            )
            projectConfig = await res.text()
            this.logger.debug(
                `Downloaded config, status: ${
                    res?.status
                }, etag: ${res?.headers.get('etag')}`,
            )
        } catch (ex) {
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
            try {
                const etag = res?.headers.get('etag') || ''
                const lastModified = res?.headers.get('last-modified') || ''
                this.setConfigBuffer(
                    `${this.sdkKey}${this.clientConfig ? '_client' : ''}`,
                    projectConfig,
                )
                this.hasConfig = true
                this.configEtag = etag
                this.configLastModified = lastModified
                return
            } catch (e) {
                logError(new Error('Invalid config JSON.'))
                res = null
            }
        }

        if (this.hasConfig) {
            this.logger.warn(
                `Failed to download config, using cached version. url: ${url}.`,
            )
        } else if (responseError?.status === 403) {
            this.stopPolling()
            throw new UserError(`Invalid SDK key provided: ${this.sdkKey}`)
        } else {
            throw new Error('Failed to download DevCycle config.')
        }
    }
}
