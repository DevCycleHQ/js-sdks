import { DevCycleOptions } from './types'
import { DevCycleCloudClient } from './cloudClient'
import { isValidServerSDKKey } from './utils/paramUtils'
import { DevCycleUser } from './models/user'

export { DevCycleCloudClient, DevCycleUser }
export * from './types'
export { dvcDefaultLogger } from './utils/logger'

type DevCycleOptionsCloudEnabled = DevCycleOptions & {
    enableCloudBucketing: true
}

export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleOptionsCloudEnabled,
): DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleOptions = {},
): DevCycleCloudClient {
    if (!sdkKey) {
        throw new Error('Missing SDK key! Call initialize with a valid SDK key')
    } else if (!isValidServerSDKKey(sdkKey)) {
        throw new Error(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    }

    return new DevCycleCloudClient(sdkKey, options, {
        platform: 'NodeJS',
        platformVersion: process?.version || undefined,
        sdkType: 'server',
    })
}
