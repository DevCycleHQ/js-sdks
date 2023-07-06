import { DevCycleOptions } from './types'
import { DevCycleClient } from './client'
import { DevCycleCloudClient } from './cloudClient'
import { isValidServerSDKKey } from './utils/paramUtils'

export { DevCycleClient, DevCycleCloudClient }
export * from './types'
export { dvcDefaultLogger } from './utils/logger'

export { DevCycleUser } from './models/user'

type DVCOptionsCloudEnabled = DevCycleOptions & { enableCloudBucketing: true }
type DVCOptionsLocalEnabled = DevCycleOptions & { enableCloudBucketing?: false }

export function initializeDevCycle(
    sdkKey: string,
    options?: DVCOptionsLocalEnabled,
): DevCycleClient
export function initializeDevCycle(
    sdkKey: string,
    options: DVCOptionsCloudEnabled,
): DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options?: DevCycleOptions,
): DevCycleClient | DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleOptions = {},
): DevCycleClient | DevCycleCloudClient {
    if (!sdkKey) {
        throw new Error('Missing SDK key! Call initialize with a valid SDK key')
    } else if (!isValidServerSDKKey(sdkKey)) {
        throw new Error(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    }

    if (options.enableCloudBucketing) {
        return new DevCycleCloudClient(sdkKey, options)
    }
    return new DevCycleClient(sdkKey, options)
}

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
