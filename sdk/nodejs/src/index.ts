import { DVCOptions } from './types'
import { DVCClient } from './client'
import { DVCCloudClient } from './cloudClient'

export { DVCClient, DVCCloudClient }
export * from './types'

export function initialize(environmentKey: string, options: DVCOptions = { enabledCloudBucketing: false }):
DVCClient | DVCCloudClient {
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    if (options.enabledCloudBucketing) {
        return new DVCCloudClient(environmentKey, options)
    }
    return new DVCClient(environmentKey, options)
}
