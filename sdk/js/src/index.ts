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
    // TODO: implement logger
    if (typeof window === 'undefined') {
        console.warn(
            'Window is not defined, try initializing in a browser context',
        )
    }

    let options = optionsArg
    let isDeferred = false
    if (isDeferredOptions(userOrOptions)) {
        isDeferred = true
        options = userOrOptions
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

    if (!isDeferred && !userOrOptions) {
        throw new Error('Missing user! Call initialize with a valid user')
    }

    if (!options || options === null) {
        throw new Error('Invalid options! Call initialize with valid options')
    }

    let client: DevCycleClient

    if (isDeferredOptions(userOrOptions)) {
        client = new DevCycleClient(sdkKey, userOrOptions)
    } else {
        client = new DevCycleClient(sdkKey, userOrOptions, options)
    }

    client
        .onClientInitialized()
        .then(() => client.logger.info('Successfully initialized DevCycle!'))
        .catch((err) =>
            client.logger.error(`Error initializing DevCycle: ${err}`),
        )

    return client
}

/**
 * @deprecated Use initializeDevCycle instead
 */
export const initialize = initializeDevCycle
