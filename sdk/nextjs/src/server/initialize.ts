import {
    DevCycleClient,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { getUserAgent } from './userAgent'
import { DevCycleNextOptions, DevCycleServerData } from '../common/types'
import { cache } from 'react'
import { getBucketedConfig, getConfigFromSource } from './bucketing'

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

export const initialize = cache(
    async (
        sdkKey: string,
        clientSDKKey: string,
        userGetter: () => DevCycleUser | Promise<DevCycleUser>,
        options: DevCycleNextOptions = {},
    ): Promise<DevCycleServerData & { client: DevCycleClient }> => {
        const [userAgent, user, configData] = await Promise.all([
            getUserAgent(options),
            cachedUserGetter(userGetter),
            getConfigFromSource(sdkKey, clientSDKKey, options),
        ])

        if (!user || typeof user.user_id !== 'string') {
            throw new Error('DevCycle user getter must return a user')
        }

        const client = initializeDevCycle(sdkKey, user, {
            ...options,
            deferInitialization: true,
            ...jsClientOptions,
        })

        let config = null
        try {
            config = await getBucketedConfig(
                configData.config,
                configData.lastModified,
                user,
                options,
                userAgent,
            )
        } catch (e) {
            console.error('Error fetching DevCycle config', e)
        }

        client.synchronizeBootstrapData(config, user, userAgent)

        return { config, user, userAgent, client }
    },
)

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
