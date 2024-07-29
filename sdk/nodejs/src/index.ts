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
import { VariableDefinitions } from '@devcycle/js-client-sdk'
import { DevCycleServerSDKOptions } from '@devcycle/types'
import { getNodeJSPlatformDetails } from './utils/platformDetails'

// Dynamically import the OpenFeature Provider, as it's an optional peer dependency
type DevCycleProviderConstructor =
    typeof import('./open-feature/DevCycleProvider').DevCycleProvider
type DevCycleProvider = InstanceType<DevCycleProviderConstructor>

class DevCycleCloudClient<
    Variables extends VariableDefinitions = VariableDefinitions,
> extends InternalDevCycleCloudClient<Variables> {
    private openFeatureProvider: DevCycleProvider

    constructor(
        sdkKey: string,
        options: DevCycleServerSDKOptions,
        platformDetails: DevCyclePlatformDetails,
    ) {
        super(sdkKey, options, platformDetails)
    }

    async getOpenFeatureProvider(): Promise<DevCycleProvider> {
        let DevCycleProviderClass

        try {
            const importedModule = await import(
                './open-feature/DevCycleProvider.js'
            )
            DevCycleProviderClass = importedModule.DevCycleProvider
        } catch (error) {
            throw new Error(
                'Missing "@openfeature/server-sdk" and/or "@openfeature/core" ' +
                    'peer dependencies to get OpenFeature Provider',
            )
        }

        if (this.openFeatureProvider) return this.openFeatureProvider

        this.openFeatureProvider = new DevCycleProviderClass(this, {
            logger: this.logger,
        })
        return this.openFeatureProvider
    }
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

import { ConfigSource } from '@devcycle/config-manager'

export { ConfigSource }

export { UserError } from '@devcycle/server-request'

type DevCycleOptionsCloudEnabled = DevCycleServerSDKOptions & {
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
