import { DevCycleEdgeClient } from './client'
import {
    DevCycleUser,
    DevCycleCloudClient,
    dvcDefaultLogger,
    DevCycleOptions,
    DVCVariableValue,
    JSON,
    DVCJSON,
    DVCCustomDataJSON,
    DVCVariable,
    DVCVariableSet,
    DVCVariableInterface,
    DVCFeature,
    DVCFeatureSet,
    DevCycleCloudOptions,
} from '@devcycle/js-cloud-server-sdk'
import { isValidServerSDKKey, DevCycleEvent } from '@devcycle/server-request'

export {
    DevCycleEdgeClient,
    DevCycleCloudClient,
    DevCycleUser,
    DevCycleOptions,
    DevCycleEvent,
    DVCVariableValue,
    JSON,
    DVCJSON,
    DVCCustomDataJSON,
    DVCVariable,
    DVCVariableSet,
    DVCVariableInterface,
    DVCFeature,
    DVCFeatureSet,
}
export { dvcDefaultLogger }

type DevCycleEdgeOptions = DevCycleCloudOptions & {
    enableCloudBucketing?: boolean
}

type DevCycleOptionsCloudEnabled = DevCycleEdgeOptions & {
    enableCloudBucketing: true
}
type DevCycleOptionsLocalEnabled = DevCycleEdgeOptions & {
    enableCloudBucketing?: false
}

export function initializeDevCycle(
    sdkKey: string,
    options?: DevCycleOptionsLocalEnabled,
): DevCycleEdgeClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleOptionsCloudEnabled,
): DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options?: DevCycleEdgeOptions,
): DevCycleEdgeClient | DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleEdgeOptions = {},
): DevCycleEdgeClient | DevCycleCloudClient {
    if (!sdkKey) {
        throw new Error('Missing SDK key! Call initialize with a valid SDK key')
    } else if (!isValidServerSDKKey(sdkKey)) {
        throw new Error(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    }

    if (options.enableCloudBucketing) {
        return new DevCycleCloudClient(sdkKey, options, options)
    }
    return new DevCycleEdgeClient(sdkKey, options)
}

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
