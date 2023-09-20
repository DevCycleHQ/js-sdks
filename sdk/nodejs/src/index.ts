import { DevCycleOptions, DevCycleEvent } from './types'
import { DevCycleClient } from './client'
import { isValidServerSDKKey } from './utils/paramUtils'
import {
    DevCycleUser,
    DevCycleCloudClient,
} from '@devcycle/js-cloud-server-sdk'
import { getNodeJSPlatformDetails } from './utils/platformDetails'

export { DevCycleClient, DevCycleCloudClient, DevCycleUser }
export * from './types'
export { dvcDefaultLogger } from './utils/logger'

/**
 * @deprecated Use DevCycleClient instead
 */
export type DVCClient = DevCycleClient
/**
 * @deprecated Use DevCycleCloudClient instead
 */
export type DVCCloudClient = DevCycleCloudClient
/**
 * @deprecated Use DevCycleUser instead
 */
export type DVCUser = DevCycleUser
/**
 * @deprecated Use DevCycleEvent instead
 */
export type DVCEvent = DevCycleEvent
/**
 * @deprecated Use DevCycleOptions instead
 */
export type DVCOptions = DevCycleOptions

type DevCycleOptionsCloudEnabled = DevCycleOptions & {
    enableCloudBucketing: true
}
type DevCycleOptionsLocalEnabled = DevCycleOptions & {
    enableCloudBucketing?: false
}

export function initializeDevCycle(
    sdkKey: string,
    options?: DevCycleOptionsLocalEnabled,
): DevCycleClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleOptionsCloudEnabled,
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
        return new DevCycleCloudClient(
            sdkKey,
            options,
            getNodeJSPlatformDetails(),
        )
    }
    return new DevCycleClient(sdkKey, options)
}

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
