import type { DevCycleOptions, DevCycleUser } from '@devcycle/devcycle-js-sdk'

type WithSDKKey = {
    sdkKey: string
}

type WithEnvironmentKey = {
    envKey: string
}

export type ProviderConfig = (WithSDKKey | WithEnvironmentKey) & {
    user?: DevCycleUser
    options?: DevCycleOptions
}
