import { DVCOptions } from './types'
import { DVCClient } from './client'
import { DVCCloudClient } from './cloudClient'

export { DVCClient, DVCCloudClient }
export * from './types'

type DVCOptionsCloudEnabled = DVCOptions & { enableCloudBucketing: true }
type DVCOptionsLocalEnabled = DVCOptions & { enableCloudBucketing?: false }

export function initialize(environmentKey: string, options?: DVCOptionsLocalEnabled): DVCClient
export function initialize(environmentKey: string, options: DVCOptionsCloudEnabled): DVCCloudClient
export function initialize(environmentKey: string, options: DVCOptions = {}): DVCClient | DVCCloudClient {
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    if (options.enableCloudBucketing) {
        return new DVCCloudClient(environmentKey, options)
    }
    return new DVCClient(environmentKey, options)
}
