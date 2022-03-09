import {
    DVCOptions,
} from './types'
import { DVCUser, UserParam } from './User'
import { DVCClient } from './Client'

export * from './types'

export const initialize = (environmentKey: string, user: UserParam, options?: DVCOptions): DVCClient => {
    // TODO: implement logger
    if (!window) {
        console.log('Window is not defined, try initializing in a browser context')
    }
    if (!window.addEventListener && !options?.reactNative) {
        throw new Error('Window is not defined, try initializing in a browser context. If running on React Native, initialize with the option reactNative: true')
    }
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    const dvcUser: DVCUser = new DVCUser(user, options)
    const client = new DVCClient(environmentKey, dvcUser, options)

    client.onClientInitialized()
        .then(() => console.log('Successfully initialized DevCycle!'))
        .catch((err) => console.log(`Error initializing DevCycle: ${err}`))

    if (!options?.reactNative) {
        window.addEventListener('pagehide', () => {
          client.flushEvents()
        })
    }

    return client
}

export default { initialize }
