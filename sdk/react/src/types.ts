import type { DVCOptions, DVCUser } from '@devcycle/devcycle-js-sdk'

export interface ProviderConfig {
  sdkKey?: string,
  envKey?: string,
  user?: DVCUser
  options?: DVCOptions
}
