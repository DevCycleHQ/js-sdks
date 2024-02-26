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
    userGetter: () => DevCycleUser | Promise<DevCycleUser>,
    options: DevCycleNextOptions = {},
): Promise<DevCycleServerData> => {
    // TODO moving this call to inside `getBucketedConfig` appears to cause static build issues from reading headers
    // Might be a bug in Next, if moving this make sure to verify you can `yarn next build` the e2e app router app
    const userAgent = getUserAgent(options)

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
        config = await getBucketedConfig(sdkKey, user, options, userAgent)
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
        await client.synchronizeBootstrapData(
            config,
            user,
            getUserAgent(options),
        )
    }

    return { config, user, options, sdkKey }
}

export const validateSDKKey = (sdkKey: string): void => {
    if (!sdkKey) {
        throw new Error(
            'Missing SDK key! Provide a valid SDK key to DevCycleServersideProvider',
        )
    }

    // attempt to make sure server keys don't leak to the client!
    if (
        sdkKey?.length &&
        !sdkKey.startsWith('dvc_client') &&
        !sdkKey.startsWith('client')
    ) {
        throw new Error(
            'Must use a client SDK key. This key will be sent to the client!',
        )
    }
}
