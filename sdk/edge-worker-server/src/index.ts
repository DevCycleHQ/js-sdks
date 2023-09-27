import { DevCycleEdgeClient } from './client'
import {
    DevCycleUser,
    DevCycleCloudClient,
    dvcDefaultLogger,
    isValidServerSDKKey,
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
    DevCycleCloudOptions,
} from '@devcycle/js-cloud-server-sdk'

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

type DevCycleOptionsCloudEnabled = DevCycleCloudOptions & {
    enableCloudBucketing: true
}
type DevCycleOptionsLocalEnabled = DevCycleCloudOptions & {
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
    options?: DevCycleCloudOptions,
): DevCycleEdgeClient | DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleCloudOptions = {},
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
