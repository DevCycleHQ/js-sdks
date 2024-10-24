import { DevCycleUser, initializeDevCycle } from '@devcycle/js-client-sdk'
import { getClient, setClient } from './requestContext'
import { getUserAgent } from './userAgent'
import { DevCycleNextOptions, DevCycleServerData } from '../common/types'
import { cache } from 'react'
import { getBucketedConfig } from './bucketing'

const jsClientOptions = {
    // pass next object to enable "next" mode in JS SDK
    next: {},
    disableConfigCache: true,
    disableRealtimeUpdates: true,
    disableAutomaticEventLogging: true,
    disableCustomEventLogging: true,
    sdkPlatform: 'nextjs',
}

const cachedUserGetter = cache(
    async (
        userGetter: () => DevCycleUser | Promise<DevCycleUser>,
    ): Promise<DevCycleUser> => {
        return userGetter()
    },
)

export const initialize = async (
    sdkKey: string,
    clientSDKKey: string,
    userGetter: () => DevCycleUser | Promise<DevCycleUser>,
    options: DevCycleNextOptions = {},
): Promise<DevCycleServerData> => {
    // TODO moving this call to inside `getBucketedConfig` appears to cause static build issues from reading headers
    // Might be a bug in Next, if moving this make sure to verify you can `yarn next build` the e2e app router app
    const userAgent = await getUserAgent(options)

    const user = await cachedUserGetter(userGetter)
    if (!user || typeof user.user_id !== 'string') {
        throw new Error('DevCycle user getter must return a user')
    }

    const initializeAlreadyCalled = !!getClient()

    if (!initializeAlreadyCalled) {
        setClient(
            initializeDevCycle(sdkKey, user, {
                ...options,
                deferInitialization: true,
                ...jsClientOptions,
            }),
        )
    }

    let config = null
    try {
        config = await getBucketedConfig(
            sdkKey,
            clientSDKKey,
            user,
            options,
            userAgent,
        )
    } catch (e) {
        console.error('Error fetching DevCycle config', e)
    }

    const client = getClient()

    if (!client) {
        throw new Error(
            "React 'cache' function not working as expected. Please contact DevCycle support.",
        )
    }

    if (!initializeAlreadyCalled) {
        client.synchronizeBootstrapData(config, user, userAgent)
    }

    return { config, user, userAgent }
}

export const validateSDKKey = (
    sdkKey: string,
    type: 'server' | 'client',
): void => {
    if (!sdkKey) {
        throw new Error(
            `Missing ${type} SDK key! Provide a valid SDK key to DevCycleServersideProvider`,
        )
    }

    // attempt to make sure server keys don't leak to the client!
    if (
        sdkKey?.length &&
        !sdkKey.startsWith(`dvc_${type}`) &&
        !sdkKey.startsWith(type)
    ) {
        throw new Error(`Must use a ${type} SDK key.`)
    }
}
