import {
    DevCycleOptions,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { getClient, setClient, setOptions, setSDKKey } from './requestContext'
import { getUserIdentity, identifyUser } from './identify'
import { getDevCycleServerData } from './devcycleServerData'
import { getUserAgent } from './userAgent'

export type DevCycleNextOptions = DevCycleOptions & {
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
     */
    staticMode?: boolean
}

const jsClientOptions = {
    // pass next object to enable "next" mode in JS SDK
    next: {},
    disableConfigCache: true,
    disableRealtimeUpdates: true,
    disableAutomaticEventLogging: true,
    disableCustomEventLogging: true,
}

export const setupContext = (
    sdkKey: string,
    user: DevCycleUser,
    options: DevCycleNextOptions = {},
): void => {
    setSDKKey(sdkKey)
    setOptions(options)

    setClient(
        initializeDevCycle(sdkKey, user, {
            ...options,
            deferInitialization: true,
            ...jsClientOptions,
        }),
    )

    identifyUser(user)
}

export const initialize = async (): Promise<
    Awaited<ReturnType<typeof getDevCycleServerData>>
> => {
    const context = await getDevCycleServerData()

    const client = getClient()
    const user = getUserIdentity()

    if (!client || !user) {
        throw new Error(
            "React 'cache' function not working as expected. Please contact DevCycle support.",
        )
    }

    client.synchronizeBootstrapData(context.config, user, getUserAgent())

    return context
}
