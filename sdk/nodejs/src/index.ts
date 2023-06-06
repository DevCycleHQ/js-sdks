import { DVCOptions } from './types'
import { DVCClient } from './client'
import { DVCCloudClient } from './cloudClient'
import { isValidServerSDKKey } from './utils/paramUtils'

export { DVCClient, DVCCloudClient }
export * from './types'
export { dvcDefaultLogger } from './utils/logger'

export { DVCUser } from './models/user'

type DVCOptionsCloudEnabled = DVCOptions & { enableCloudBucketing: true }
type DVCOptionsLocalEnabled = DVCOptions & { enableCloudBucketing?: false }

export function initialize(
  sdkKey: string,
  options?: DVCOptionsLocalEnabled,
): DVCClient
export function initialize(
  sdkKey: string,
  options: DVCOptionsCloudEnabled,
): DVCCloudClient
export function initialize(
  sdkKey: string,
  options?: DVCOptions,
): DVCClient | DVCCloudClient
export function initialize(
  sdkKey: string,
  options: DVCOptions = {},
): DVCClient | DVCCloudClient {
  if (!sdkKey) {
    throw new Error('Missing SDK key! Call initialize with a valid SDK key')
  } else if (!isValidServerSDKKey(sdkKey)) {
    throw new Error(
      'Invalid SDK key provided. Please call initialize with a valid server SDK key',
    )
  }

  if (options.enableCloudBucketing) {
    return new DVCCloudClient(sdkKey, options)
  }
  return new DVCClient(sdkKey, options)
}
