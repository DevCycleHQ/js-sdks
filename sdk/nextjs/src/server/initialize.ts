import { DevCycleUser, initializeDevCycle } from '@devcycle/js-client-sdk'
import { getClient, setClient, setOptions, setSDKKey } from './requestContext'
import { identifyUser } from './identify'
import { getDevCycleServerData } from './devcycleServerData'
import { getUserAgent } from './userAgent'
import { DevCycleNextOptions } from '../common/types'

const jsClientOptions = {
    // pass next object to enable "next" mode in JS SDK
    next: {},
    disableConfigCache: true,
    disableRealtimeUpdates: true,
    disableAutomaticEventLogging: true,
    disableCustomEventLogging: true,
}

export const initialize = async (
    sdkKey: string,
    userGetter: () => DevCycleUser | Promise<DevCycleUser>,
    options: DevCycleNextOptions = {},
): Promise<Awaited<ReturnType<typeof getDevCycleServerData>>> => {
    setSDKKey(sdkKey)
    setOptions(options)
    const user = await userGetter()
    if (!user || typeof user.user_id !== 'string') {
        throw new Error('DevCycle user getter must return a user')
    }
    identifyUser(user)

    setClient(
        initializeDevCycle(sdkKey, user, {
            ...options,
            deferInitialization: true,
            ...jsClientOptions,
        }),
    )

    const context = await getDevCycleServerData()

    const client = getClient()

    if (!client) {
        throw new Error(
            "React 'cache' function not working as expected. Please contact DevCycle support.",
        )
    }

    client.synchronizeBootstrapData(context.config, user, getUserAgent())

    return context
}
