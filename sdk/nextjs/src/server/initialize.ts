import {
    DevCycleOptions,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { getClient, setClient, setOptions, setSDKKey } from './requestContext'
import { identifyInitialUser, identifyUser } from './identify'
import { getDevCycleServerData } from './devcycleServerData'
import { fallbackConfig } from '../common/fallbackConfig'

export type DevCycleNextOptions = DevCycleOptions & {
    /**
     * Option to enable the ability to identify a user clientside. This allows `identifyUser` to be called in a client
     * component and synchronizes the user data via a cookie. The method will only work if cookie support is enabled
     * on the browser.
     * Enabling this option will also cause every component below this point to be rendered dynamically. If you want to
     * use static generation, you should disable this option and always provide the correct user on the serverside.
     */
    enableClientsideIdentify?: boolean
    /**
     * Make the SDK's initialization non-blocking. This unblocks serverside rendering up to the point of a variable
     * evaluation, and allows the use of a Suspense boundary to stream flagged components to the client when the
     * configuration is ready.
     *
     * When this is enabled, client components will initially render using default variable values,
     * and will re-render when the configuration is ready.
     */
    enableStreaming?: boolean
}

const jsClientOptions = {
    next: {
        // don't allow the config to be fetched inside the SDK
        configRefreshHandler: async () => {},
    },
    disableAutomaticEventLogging: true,
    disableCustomEventLogging: true,
    disableConfigCache: true,
}

export const initialize = async (
    sdkKey: string,
    user: DevCycleUser,
    options: DevCycleNextOptions = {},
) => {
    setSDKKey(sdkKey)
    setOptions(options)

    const { enableClientsideIdentify = false, enableStreaming = false } =
        options

    if (enableStreaming) {
        setClient(
            initializeDevCycle(sdkKey, user, {
                ...options,
                bootstrapConfig: fallbackConfig,
                ...jsClientOptions,
            }),
        )
    }

    if (enableClientsideIdentify) {
        await identifyInitialUser(user)
    } else {
        await identifyUser(user)
    }

    const context = await getDevCycleServerData()

    let client = getClient()
    if (!client) {
        setClient(
            initializeDevCycle(sdkKey, user, {
                ...options,
                bootstrapConfig: context.config,
                ...jsClientOptions,
            }),
        )
    } else {
        client.synchronizeBootstrapData(context.config, user)
    }

    console.log('Done Initializing.')

    return context
}
