import {
    DevCycleOptions,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { getClient, setClient, setOptions, setSDKKey } from './requestContext'
import { identifyInitialUser, identifyUser } from './identify'
import { getDevCycleServerData } from './devcycleServerData'
import { getUserAgent } from './userAgent'

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

    /**
     * Used to disable any SDK features that require dynamic request context. This allows the SDK to be used in pages
     * that are intended to be statically generated, as long as nothing else on that page consumes request details
     * like headers or cookies.
     * This option will disable the following features:
     * - automatic user agent parsing to populate targeting rule data for Platform Version and Device Model
     *
     * enableClientsideIdentify cannot be true while this is set
     */
    staticMode?: boolean
}

const jsClientOptions = {
    next: {
        configRefreshHandler: async () => {
            // don't allow the config to be fetched inside the SDK
        },
    },
    disableConfigCache: true,
}

export const initialize = async (
    sdkKey: string,
    user: DevCycleUser,
    options: DevCycleNextOptions = {},
): Promise<Awaited<ReturnType<typeof getDevCycleServerData>>> => {
    setSDKKey(sdkKey)
    setOptions(options)

    const { enableClientsideIdentify = false, staticMode = false } = options

    if (enableClientsideIdentify && staticMode) {
        throw new Error(
            'enableClientsideIdentify cannot be true while staticMode is enabled',
        )
    }

    setClient(
        initializeDevCycle(sdkKey, user, {
            ...options,
            deferInitialization: true,
            ...jsClientOptions,
        }),
    )

    if (enableClientsideIdentify) {
        identifyInitialUser(user)
    } else {
        identifyUser(user)
    }

    const context = await getDevCycleServerData()

    const client = getClient()
    if (!client) {
        setClient(
            initializeDevCycle(sdkKey, user, {
                ...options,
                bootstrapConfig: context.config,
                ...jsClientOptions,
            }),
        )
    } else {
        client.synchronizeBootstrapData(context.config, user, getUserAgent())
    }

    return context
}
