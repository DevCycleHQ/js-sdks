import { DVCOptions } from './types'
import { DVCClient } from './client'
import { DVCCloudClient } from './cloudClient'
import { isValidServerEnvKey } from './utils/paramUtils'

export { DVCClient, DVCCloudClient }
export * from './types'

export { DVCUser } from './models/user'

type DVCOptionsCloudEnabled = DVCOptions & { enableCloudBucketing: true }
type DVCOptionsLocalEnabled = DVCOptions & { enableCloudBucketing?: false }

export function initialize(environmentKey: string, options?: DVCOptionsLocalEnabled): DVCClient
export function initialize(environmentKey: string, options: DVCOptionsCloudEnabled): DVCCloudClient
export function initialize(environmentKey: string, options?: DVCOptions): DVCClient | DVCCloudClient
export function initialize(environmentKey: string, options: DVCOptions = {}): DVCClient | DVCCloudClient {
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    } else if (!isValidServerEnvKey(environmentKey)) {
        throw new Error('Invalid environment key provided. Please call initialize with a valid server environment key')
    }

    if (options.enableCloudBucketing) {
        return new DVCCloudClient(environmentKey, options)
    }
    return new DVCClient(environmentKey, options)
}
