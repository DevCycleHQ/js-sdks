/// <reference path='../types.d.ts'/>
import {
    DVCOptions,
} from 'dvc-js-client-sdk'
import { DVCUser, UserParam } from './User'
import { DVCClient } from './Client'
import { isWeb } from './utils'

export const initialize = (environmentKey: string, user: UserParam, options?: DVCOptions): DVCClient => {
    // TODO: implement logger
    if (!window) {
        console.log('Window is not defined, try initializing in a browser context')
    }
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    const dvcUser: DVCUser = new DVCUser(user)
    const client = new DVCClient(environmentKey, dvcUser, options)

    client.onClientInitialized()
        .then(() => console.log('Successfully initialized DevCycle!'))
        .catch(err => console.log(`Error initializing DevCycle: ${err}`))

    if (isWeb()) {
      window.addEventListener('pagehide', () => {
        client.flushEvents()
    })
    }
    
    return client
}

export default { initialize }
