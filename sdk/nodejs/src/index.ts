import { DVCOptions } from './types'
import { DVCClient } from './client'
import { DVCCloudClient } from './cloudClient'
import { isValidServerSDKKey } from './utils/paramUtils'

export { DVCClient, DVCCloudClient }
export * from './types'

export { DVCUser } from './models/user'

type DVCOptionsCloudEnabled = DVCOptions & { enableCloudBucketing: true }
type DVCOptionsLocalEnabled = DVCOptions & { enableCloudBucketing?: false }

export function initialize(sdkKey: string, options?: DVCOptionsLocalEnabled): DVCClient
export function initialize(sdkKey: string, options: DVCOptionsCloudEnabled): DVCCloudClient
export function initialize(sdkKey: string, options?: DVCOptions): DVCClient | DVCCloudClient
export function initialize(sdkKey: string, options: DVCOptions = {}): DVCClient | DVCCloudClient {
    if (!sdkKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    } else if (!isValidServerSDKKey(sdkKey)) {
        throw new Error('Invalid environment key provided. Please call initialize with a valid server environment key')
    }

    if (options.enableCloudBucketing) {
        return new DVCCloudClient(sdkKey, options)
    }
    return new DVCClient(sdkKey, options)
}
