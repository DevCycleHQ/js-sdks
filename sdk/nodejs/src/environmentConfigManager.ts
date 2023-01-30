import { ConfigBody, DVCLogger } from '@devcycle/types'
import { DVCOptions } from './types'
import { getEnvironmentConfig, ResponseError } from './request'
import { getBucketingLib } from './bucketing'
import { UserError } from './utils/userError'

type ConfigPollingOptions = DVCOptions & {
    cdnURI?: string
}

export class EnvironmentConfigManager {
    private readonly logger: DVCLogger
    private readonly environmentKey: string
    private hasConfig = false
    configEtag?: string
    private readonly pollingIntervalMS: number
    private readonly requestTimeoutMS: number
    private readonly cdnURI: string
    fetchConfigPromise: Promise<void>
    private intervalTimeout?: NodeJS.Timeout
    private disablePolling = false

    constructor(
        logger: DVCLogger,
        environmentKey: string,
        {
            configPollingIntervalMS = 10000,
            configPollingTimeoutMS = 5000,
            configCDNURI,
            cdnURI = 'https://config-cdn.devcycle.com'
        }: ConfigPollingOptions
    ) {
        this.logger = logger
        this.environmentKey = environmentKey
        this.pollingIntervalMS = configPollingIntervalMS >= 1000
            ? configPollingIntervalMS
            : 1000
        this.requestTimeoutMS = configPollingTimeoutMS >= this.pollingIntervalMS
            ? this.pollingIntervalMS
            : configPollingTimeoutMS
        this.cdnURI = configCDNURI || cdnURI

        this.fetchConfigPromise = this._fetchConfig().then(() => {
            this.logger.debug('DevCycle initial config loaded')
        }).finally(() => {
            if (this.disablePolling) {
                return
            }
            this.intervalTimeout = setInterval(async () => {
                try {
                    await this._fetchConfig()
                } catch (ex) {
                    this.logger.error(ex.message)
                }
            }, this.pollingIntervalMS)
        })
    }

    stopPolling(): void {
        this.disablePolling = true
        clearInterval(this.intervalTimeout)
    }

    cleanup(): void {
        this.stopPolling()
    }

    getConfigURL(): string {
        return `${this.cdnURI}/config/v1/server/${this.environmentKey}.json`
    }

    async _fetchConfig(): Promise<void> {
        const url = this.getConfigURL()
        let res: Response | null
        let projectConfig: string | null = null
        let responseError: ResponseError | null = null

        const logError = (error: any) => {
            const errMsg = `Request to get config failed for url: ${url}, ` +
                `response message: ${error.message}, response data: ${projectConfig}`
            if (this.hasConfig) {
                this.logger.debug(errMsg)
            } else {
                this.logger.error(errMsg)
            }
        }

        try {
            this.logger.debug(`Requesting new config for ${url}, etag: ${this.configEtag}`)
            res = await getEnvironmentConfig(url, this.requestTimeoutMS, this.configEtag)
            projectConfig = await res.text()
            this.logger.debug(`Downloaded config, status: ${res?.status}, etag: ${res?.headers.get('etag')}`)
        } catch (ex) {
            logError(ex)
            res = null
            if (ex instanceof ResponseError) {
                responseError = ex
            }
        }

        if (res?.status === 304) {
            this.logger.debug(`Config not modified, using cache, etag: ${this.configEtag}`)
            return
        } else if (res?.status === 200 && projectConfig) {
            try {
                getBucketingLib().setConfigData(this.environmentKey, projectConfig)
                this.hasConfig = true
                this.configEtag = res?.headers.get('etag') || ''
                return
            } catch (e) {
                logError(new Error('Invalid config JSON.'))
                res = null
            }
        }

        if (this.hasConfig) {
            this.logger.debug(`Failed to download config, using cached version. url: ${url}.`)
        } else if (responseError?.status === 403) {
            this.stopPolling()
            throw new UserError(`Invalid SDK key provided: ${this.environmentKey}`)
        } else {
            throw new Error('Failed to download DevCycle config.')
        }
    }
}
