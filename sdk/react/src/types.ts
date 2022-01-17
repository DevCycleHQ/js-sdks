import { DVCUser } from 'dvc-js-client-sdk'

export interface ProviderConfig {
  envKey: string
  user?: DVCUser
}
