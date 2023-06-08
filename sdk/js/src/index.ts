import { DVCOptions, DVCUser } from './types'
import {
    DVCClient,
    DVCOptionsWithDeferredInitialization,
    isDeferredOptions,
} from './Client'

export * from './types'

export function initialize(
    sdkKey: string,
    options: DVCOptionsWithDeferredInitialization,
): DVCClient
export function initialize(
    sdkKey: string,
    user: DVCUser,
    options?: DVCOptions,
): DVCClient
export function initialize(
    sdkKey: string,
    userOrOptions: DVCUser | DVCOptionsWithDeferredInitialization,
    optionsArg: DVCOptions = {},
): DVCClient {
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

    let client: DVCClient

    if (isDeferredOptions(userOrOptions)) {
        client = new DVCClient(sdkKey, userOrOptions)
    } else {
        client = new DVCClient(sdkKey, userOrOptions, options)
    }

    client
        .onClientInitialized()
        .then(() => client.logger.info('Successfully initialized DevCycle!'))
        .catch((err) =>
            client.logger.error(`Error initializing DevCycle: ${err}`),
        )

    if (!options?.reactNative && typeof window !== 'undefined') {
        window.addEventListener('pagehide', () => {
            client.flushEvents()
        })
    }

    return client
}

export default { initialize }
