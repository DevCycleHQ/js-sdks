import { DevCycleClient } from './client'
import {
    DevCycleUser,
    DevCycleCloudClient as InternalDevCycleCloudClient,
    dvcDefaultLogger,
    isValidServerSDKKey,
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
    DevCyclePlatformDetails,
} from '@devcycle/js-cloud-server-sdk'
import { DevCycleServerSDKOptions } from '@devcycle/types'
import { getNodeJSPlatformDetails } from './utils/platformDetails'

// Dynamically import the OpenFeature Provider, as it's an optional peer dependency
// type DevCycleProviderConstructor =
//     typeof import('./open-feature-provider/DevCycleProvider').DevCycleProvider
// type DevCycleProvider = InstanceType<DevCycleProviderConstructor>

class DevCycleCloudClient extends InternalDevCycleCloudClient {
    // private openFeatureProvider: DevCycleProvider

    constructor(
        sdkKey: string,
        options: DevCycleServerSDKOptions,
        platformDetails: DevCyclePlatformDetails,
    ) {
        super(sdkKey, options, platformDetails)
    }

    // async getOpenFeatureProvider(): Promise<DevCycleProvider> {
    //     let DevCycleProviderClass
    //
    //     try {
    //         const importedModule = await import(
    //             './open-feature-provider/DevCycleProvider.js'
    //         )
    //         DevCycleProviderClass = importedModule.DevCycleProvider
    //     } catch (error) {
    //         throw new Error(
    //             'Missing "@openfeature/server-sdk" and/or "@openfeature/core" ' +
    //                 'peer dependencies to get OpenFeature Provider',
    //         )
    //     }
    //
    //     if (this.openFeatureProvider) return this.openFeatureProvider
    //
    //     this.openFeatureProvider = new DevCycleProviderClass(this, {
    //         logger: this.logger,
    //     })
    //     return this.openFeatureProvider
    // }
}

export {
    DevCycleClient,
    DevCycleCloudClient,
    DevCycleUser,
    DevCycleServerSDKOptions as DevCycleOptions,
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
export type DVCOptions = DevCycleServerSDKOptions

type DevCycleOptionsCloudEnabled = DevCycleServerSDKOptions & {
    enableCloudBucketing: true
}
type DevCycleOptionsLocalEnabled = DevCycleServerSDKOptions & {
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
    options?: DevCycleServerSDKOptions,
): DevCycleClient | DevCycleCloudClient
export function initializeDevCycle(
    sdkKey: string,
    options: DevCycleServerSDKOptions = {},
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
