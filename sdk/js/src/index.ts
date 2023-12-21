import {
    DevCycleEvent,
    DevCycleOptions,
    DevCycleUser,
    VariableDefinitions,
} from './types'
import {
    DevCycleClient,
    DevCycleOptionsWithDeferredInitialization,
    isDeferredOptions,
} from './Client'

export * from './types'
export { dvcDefaultLogger } from './logger'

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

export type { DevCycleOptionsWithDeferredInitialization }
export { DevCycleClient }

const determineUserAndOptions = (
    userOrOptions: DevCycleUser | DevCycleOptionsWithDeferredInitialization,
    optionsArg: DevCycleOptions = {},
):
    | {
          user: undefined
          options: DevCycleOptionsWithDeferredInitialization
          isDeferred: true
      }
    | {
          user: DevCycleUser
          options: DevCycleOptions
          isDeferred: false
      } => {
    let user: DevCycleUser | undefined = undefined
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
>(
    sdkKey: string,
    options: DevCycleOptionsWithDeferredInitialization,
): DevCycleClient<Variables>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    user: DevCycleUser,
    options?: DevCycleOptions,
): DevCycleClient<Variables>
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    userOrOptions: DevCycleUser | DevCycleOptionsWithDeferredInitialization,
    optionsArg: DevCycleOptions = {},
): DevCycleClient<Variables> {
    const userAndOptions = determineUserAndOptions(userOrOptions, optionsArg)
    const { options } = userAndOptions

    // TODO: implement logger
    if (typeof window === 'undefined' && !options.next) {
        console.warn(
            'Window is not defined, try initializing in a browser context',
        )
    }

    if (
        typeof window !== 'undefined' &&
        !window.addEventListener &&
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

    if (!sdkKey) {
        throw new Error('Missing SDK key! Call initialize with a valid SDK key')
    }

    if (!options || options === null) {
        throw new Error('Invalid options! Call initialize with valid options')
    }

    let client: DevCycleClient

    if (userAndOptions.isDeferred) {
        client = new DevCycleClient(sdkKey, undefined, userAndOptions.options)
    } else {
        client = new DevCycleClient(
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
