import {
    DevCycleEvent,
    DevCycleOptions,
    DevCycleUser,
    UserError,
    DVCCustomDataJSON,
} from './types'
import {
    DevCycleClient,
    DevCycleOptionsWithDeferredInitialization,
} from './Client'
import { checkIsServiceWorker } from './utils'

export * from './types'
export { dvcDefaultLogger } from './logger'

import { VariableDefinitions } from '@devcycle/types'
export { VariableDefinitions }

/**
 * @deprecated Use DevCycleClient instead
 */
export type DVCClient = DevCycleClient
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
/**
 * @deprecated Use DevCycleOptionsWithDeferredInitialization instead
 */
export type DVCOptionsWithDeferredInitialization =
    DevCycleOptionsWithDeferredInitialization

export type { DevCycleOptionsWithDeferredInitialization, DevCycleClient }

const determineUserAndOptions = <
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>(
    userOrOptions:
        | DevCycleUser<CustomData>
        | DevCycleOptionsWithDeferredInitialization,
    optionsArg: DevCycleOptions = {},
):
    | {
          user: undefined
          options: DevCycleOptionsWithDeferredInitialization
          isDeferred: true
      }
    | {
          user: DevCycleUser<CustomData>
          options: DevCycleOptions
          isDeferred: false
      } => {
    let user: DevCycleUser<CustomData> | undefined = undefined
    if (!!userOrOptions && 'deferInitialization' in userOrOptions) {
        if (userOrOptions.deferInitialization) {
            return {
                user: undefined,
                options:
                    userOrOptions as DevCycleOptionsWithDeferredInitialization,
                isDeferred: true,
            }
        }
    } else {
        user = userOrOptions
    }

    if (!user) {
        throw new Error('Missing user! Call initialize with a valid user')
    }

    return { user, options: optionsArg, isDeferred: false }
}

export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>(
    sdkKey: string,
    options: DevCycleOptionsWithDeferredInitialization,
): DevCycleClient<Variables, CustomData>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>(
    sdkKey: string,
    user: DevCycleUser<CustomData>,
    options?: DevCycleOptions,
): DevCycleClient<Variables, CustomData>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>(
    sdkKey: string,
    userOrOptions:
        | DevCycleUser<CustomData>
        | DevCycleOptionsWithDeferredInitialization,
    optionsArg: DevCycleOptions = {},
): DevCycleClient<Variables, CustomData> {
    if (!sdkKey) {
        throw new UserError(
            'Missing SDK key! Call initialize with a valid SDK key',
        )
    }

    if (
        !sdkKey.startsWith('client') &&
        !sdkKey.startsWith('dvc_client') &&
        !optionsArg?.next
    ) {
        throw new UserError(
            'Invalid SDK key provided. Please call initialize with a valid client SDK key',
        )
    }

    const userAndOptions = determineUserAndOptions<CustomData>(
        userOrOptions,
        optionsArg,
    )
    const { options } = userAndOptions
    const isServiceWorker = checkIsServiceWorker()

    if (
        typeof window !== 'undefined' &&
        !window.addEventListener &&
        !isServiceWorker &&
        !options?.reactNative
    ) {
        throw new Error(
            'Window is not defined, try initializing in a browser context.' +
                ' If running on React Native, initialize with the option reactNative: true',
        )
    }

    if (options?.reactNative && !globalThis.DeviceInfo) {
        throw new Error(
            'DeviceInfo is not defined. ' +
                'Import react-native-device-info and set global.DeviceInfo when running on React Native',
        )
    }

    if (!options || options === null) {
        throw new Error('Invalid options! Call initialize with valid options')
    }

    let client: DevCycleClient<Variables, CustomData>

    if (userAndOptions.isDeferred) {
        client = new DevCycleClient(sdkKey, undefined, userAndOptions.options)
    } else {
        client = new DevCycleClient<Variables, CustomData>(
            sdkKey,
            userAndOptions.user,
            userAndOptions.options,
        )
    }

    client
        .onClientInitialized()
        .then(() => client.logger.info('Successfully initialized DevCycle!'))
        .catch((err) =>
            client.logger.error(`Error initializing DevCycle: ${err}`),
        )

    return client
}

export { DVCPopulatedUser } from './User'

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
