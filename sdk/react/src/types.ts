import type { DVCOptions, DVCUser } from '@devcycle/devcycle-js-sdk'

export interface ProviderConfig {
  envKey: string
  user?: DVCUser
  options?: DVCOptions
}
