import { DevCycleOptions } from './types'
import { DevCycleCloudClient } from './cloudClient'
import { isValidServerSDKKey } from './utils/paramUtils'
import { DevCycleUser } from './models/user'

export { DevCycleCloudClient, DevCycleUser }
export * from './models/populatedUser'
export * from './models/user'
export * from './models/variable'
export * from './types'
export * from './request'
export * from './utils/logger'
export * from './utils/paramUtils'

type DevCycleCloudOptions = Pick<
    DevCycleOptions,
    'logger' | 'logLevel' | 'enableEdgeDB' | 'bucketingAPIURI'
> & {
    platform?: 'NodeJS' | 'Electron' | 'EdgeWorker'
    platformVersion?: string
    hostname?: string
}

export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleCloudOptions = {},
): DevCycleCloudClient {
    if (!sdkKey) {
        throw new Error('Missing SDK key! Call initialize with a valid SDK key')
    } else if (!isValidServerSDKKey(sdkKey)) {
        throw new Error(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    }

    return new DevCycleCloudClient(sdkKey, options, {
        platform: options.platform || 'NodeJS',
        platformVersion: options.platformVersion || undefined,
        sdkType: 'server',
        hostname: options.hostname || undefined,
    })
}
