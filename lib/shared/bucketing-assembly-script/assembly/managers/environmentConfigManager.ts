// import { AxiosResponse } from 'axios'
// import { ConfigBody } from '@devcycle/types'
// import { DVCLogger, DVCOptions } from './types'
// import { getEnvironmentConfig } from './request'
// import { getBucketingLib } from './bucketing'

// import { setInterval, clearInterval } from '../helpers/setInterval'

// type ConfigPollingOptions = {
//     /**
//      * Controls the polling interval in milliseconds to fetch new environment config changes, defaults to 10 seconds.
//      * @min 1000
//      */
//     configPollingIntervalMS: number | null
//
//     /**
//      * Controls the request timeout to fetch new environment config changes, defaults to 5 seconds,
//      * must be less than the configPollingIntervalMS value.
//      * @min 1000
//      */
//     configPollingTimeoutMS: number | null
//
//     cdnURI: string | null
// }

export class EnvironmentConfigManager {
    // private readonly logger: DVCLogger
    private readonly environmentKey: string
    // private hasConfig: boolean = false
    // configEtag: string | null
    private readonly pollingIntervalMS: f32 = 10000
    // private readonly requestTimeoutMS: i32
    private readonly cdnURI: string = 'https://config-cdn.devcycle.com'
    // fetchConfigPromise: Promise<void>
    private intervalTimeout: i32

    constructor(
        // logger: DVCLogger,
        environmentKey: string,
        // {
        //     configPollingIntervalMS = 10000,
        //     configPollingTimeoutMS = 5000,
        //     cdnURI = 'https://config-cdn.devcycle.com'
        // }: ConfigPollingOptions
    ) {
        // const configPollingIntervalMS = 10000
        // const configPollingTimeoutMS = 5000
        // const cdnURI = 'https://config-cdn.devcycle.com'

        // this.logger = logger
        this.environmentKey = environmentKey
        // this.pollingIntervalMS = (configPollingIntervalMS !== null && configPollingIntervalMS >= 1000)
        //     ? configPollingIntervalMS
        //     : 1000
        // this.requestTimeoutMS = (configPollingTimeoutMS !== null && configPollingTimeoutMS >= this.pollingIntervalMS)
        //     ? this.pollingIntervalMS
        //     : configPollingTimeoutMS || 5000
        // this.cdnURI = cdnURI || 'https://config-cdn.devcycle.com'

        // this.fetchConfigPromise =
        this._fetchConfig(() => {
            console.log('DevCycle initial config loaded')
        })

        // this.intervalTimeout = setInterval(() => {
        //     console.log('_fetchConfig()')
        //     // self._fetchConfig(callback)
        // }, this.pollingIntervalMS)
    }

    // cleanup(): void {
    //     clearInterval(this.intervalTimeout)
    // }

    getConfigURL(): string {
        return `${this.cdnURI}/config/v1/server/${this.environmentKey}.json`
    }

    //
    _fetchConfig(callback: () => void): void {
        console.log('_fetchConfig()')
        if (callback) callback()

        // const url = this.getConfigURL()
        // let res: AxiosResponse<ConfigBody> | null
        // try {
        //     // this.logger.debug(`Requesting new config for ${url}, etag: ${this.configEtag}`)
        //     res = await getEnvironmentConfig(url, this.requestTimeoutMS, this.configEtag)
        //     // this.logger.debug(`Downloaded config, status: ${res?.status}, etag: ${res?.headers?.etag}`)
        // } catch (ex) {
        //     // this.logger.error(`Request to get config failed for url: ${url}, ` +
        //     //     `response message: ${ex.message}, response data ${ex?.response?.data}`)
        //     res = null
        // }
        //
        // if (res?.status === 304) {
        //     // this.logger.debug(`Config not modified, using cache, etag: ${this.configEtag}`)
        // } else if (res?.status === 200) {
        //     getBucketingLib().setConfigData(this.environmentKey, JSON.stringify(res.data))
        //     this.hasConfig = true
        //     this.configEtag = res?.headers?.etag
        // } else if (this.hasConfig) {
        //     // this.logger.error(`Failed to download config, using cached version. url: ${url}.`)
        // } else {
        //     throw new Error('Failed to download DevCycle config.')
        // }
    }
}
