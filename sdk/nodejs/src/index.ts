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
import { DevCycleServerSDKOptions, VariableDefinitions } from '@devcycle/types'
import { getNodeJSPlatformDetails } from './utils/platformDetails'
import { DevCycleProvider } from './open-feature/DevCycleProvider'

class DevCycleCloudClient<
    Variables extends VariableDefinitions = VariableDefinitions,
> extends InternalDevCycleCloudClient<Variables> {
    private openFeatureProvider: DevCycleProvider
    private sdkPlatform?: string

    constructor(
        sdkKey: string,
        options: DevCycleServerSDKOptions,
        platformDetails: DevCyclePlatformDetails,
    ) {
        super(sdkKey, options, platformDetails)
        this.sdkPlatform = options.sdkPlatform
    }

    /**
     * @deprecated Use DevCycleProvider directly instead.
     * See docs: https://docs.devcycle.com/sdk/server-side-sdks/node/node-openfeature
     */
    async getOpenFeatureProvider(): Promise<DevCycleProvider> {
        if (this.openFeatureProvider) return this.openFeatureProvider

        this.openFeatureProvider = new DevCycleProvider(this, {
            logger: this.logger,
        })
        this.platformDetails.sdkPlatform = this.sdkPlatform ?? 'nodejs-of'
        return this.openFeatureProvider
    }
}

export {
    DevCycleProvider,
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

import { ConfigSource } from '@devcycle/types'

export { ConfigSource }

export { UserError } from '@devcycle/types'

export type DevCycleOptionsCloudEnabled = DevCycleServerSDKOptions & {
    enableCloudBucketing: true
}

export type DevCycleOptionsLocalEnabled = DevCycleServerSDKOptions & {
    enableCloudBucketing?: false

    /**
     * Override the source to retrieve configuration from. Defaults to the DevCycle CDN
     */
    configSource?: ConfigSource
}

export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    options?: DevCycleOptionsLocalEnabled,
): DevCycleClient<Variables>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    options: DevCycleOptionsCloudEnabled,
): DevCycleCloudClient<Variables>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    options?: DevCycleServerSDKOptions,
): DevCycleClient<Variables> | DevCycleCloudClient<Variables>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    options: DevCycleServerSDKOptions = {},
): DevCycleClient<Variables> | DevCycleCloudClient<Variables> {
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
    return new DevCycleClient(sdkKey, options as DevCycleOptionsLocalEnabled)
}

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
