import type { DevCycleOptions, DevCycleUser } from '@devcycle/js-client-sdk'

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
