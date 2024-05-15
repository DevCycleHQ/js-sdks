import type { DevCycleOptions, DevCycleUser } from '@devcycle/js-client-sdk'

type WithSDKKey = {
    sdkKey: string
}

type WithEnvironmentKey = {
    envKey: string
}

type OptionsWithDebug = DevCycleOptions & {
    reactDebug?: {
        /**
         * Show borders around components that are conditionally rendered using the RenderIf helper
         */
        showConditionalBorders?: boolean

        /**
         * Hex color string for the border color to show around conditional components
         */
        borderColor?: string
    }
}

export type ProviderConfig = (WithSDKKey | WithEnvironmentKey) & {
    user?: DevCycleUser
    options?: OptionsWithDebug
}
