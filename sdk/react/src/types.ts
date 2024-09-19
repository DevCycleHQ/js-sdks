import type {
    DevCycleOptions,
    DevCycleUser,
    DVCCustomDataJSON,
} from '@devcycle/js-client-sdk'

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

export type ProviderConfig<
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
> = (WithSDKKey | WithEnvironmentKey) & {
    user?: DevCycleUser<CustomData>
    options?: OptionsWithDebug
}
