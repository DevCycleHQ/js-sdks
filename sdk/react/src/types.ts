import type { DVCOptions, DVCUser } from '@devcycle/devcycle-js-sdk'

type WithSDKKey = {
    sdkKey: string
}

type WithEnvironmentKey = {
    envKey: string
}

export type ProviderConfig = (WithSDKKey | WithEnvironmentKey) & {
    user?: DVCUser
    options?: DVCOptions
}
