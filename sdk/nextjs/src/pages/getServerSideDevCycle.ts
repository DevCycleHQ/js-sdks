import { DevCycleServerInstance, SSRProps } from './types'
import {
    DevCycleOptions,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing.js'
import { GetServerSidePropsContext } from 'next'
import { BucketedUserConfig, ConfigSource } from '@devcycle/types'

type IdentifiedUser = Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & {
    user_id: string
}

type DevCycleServersideOptions = Pick<
    DevCycleOptions,
    | 'enableObfuscation'
    | 'enableEdgeDB'
    | 'disableAutomaticEventLogging'
    | 'disableCustomEventLogging'
    | 'logger'
    | 'logLevel'
    | 'apiProxyURL'
> & {
    configSource?: ConfigSource
}

export const getServerSideDevCycleWithHelpers = async ({
    serverSDKKey,
    clientSDKKey,
    user,
    context,
    options = {},
}: {
    serverSDKKey: string
    clientSDKKey: string
    user: IdentifiedUser
    context: GetServerSidePropsContext
    options?: DevCycleServersideOptions
}): Promise<DevCycleServerInstance> => {
    // Defer initialization until the bucketed config is available
    const client = initializeDevCycle(clientSDKKey, {
        deferInitialization: true,
        disableAutomaticEventLogging: true,
        disableConfigCache: true,
        ...options,
    })
    const userAgent = context.req.headers['user-agent'] ?? null
    let bucketedConfig: BucketedUserConfig | null = null
    try {
        const bucketingConfigResult = await getBucketedConfig(
            serverSDKKey,
            user,
            userAgent,
            options.configSource,
            !!options.enableObfuscation,
            !!options.enableEdgeDB,
        )
        bucketedConfig = bucketingConfigResult.config
    } catch (e) {
        console.error('DevCycle: Error getting user config')
        // no-op
    }

    // Bootstrap the client with the bucketed config
    client.synchronizeBootstrapData(
        bucketedConfig,
        user,
        userAgent ?? undefined,
    )
    await client.onClientInitialized()

    const ssrProps: SSRProps = {
        _devcycleSSR: {
            bucketedConfig,
            user,
            sdkKey: clientSDKKey,
            userAgent,
        },
    }
    return {
        getVariableValue: async (key, defaultValue) => {
            return client.variableValue(key, defaultValue)
        },
        getAllVariables: async () => client.allVariables(),
        getAllFeatures: async () => client.allFeatures(),
        track: (event) => {
            if (!options.disableCustomEventLogging) {
                client.track(event)
            }
        },
        getSSRProps: () => {
            const shouldFlush =
                !options.disableAutomaticEventLogging ||
                !options.disableCustomEventLogging
            // Fire and forget flush events
            if (shouldFlush) {
                client.flushEvents()
            }
            return ssrProps
        },
    }
}

export const getServerSideDevCycle = async ({
    serverSDKKey,
    clientSDKKey,
    user,
    context,
    options = {},
}: {
    serverSDKKey: string
    clientSDKKey: string
    user: IdentifiedUser
    context: GetServerSidePropsContext
    options?: DevCycleServersideOptions
}): Promise<SSRProps> => {
    const { getSSRProps } = await getServerSideDevCycleWithHelpers({
        serverSDKKey,
        clientSDKKey,
        user,
        context,
        options: {
            ...options,
            disableAutomaticEventLogging: true,
        },
    })
    return getSSRProps()
}

export const getStaticDevCycle = async ({
    serverSDKKey,
    clientSDKKey,
    user,
    options = {},
}: {
    serverSDKKey: string
    clientSDKKey: string
    user: IdentifiedUser
    options: DevCycleServersideOptions
}): Promise<SSRProps> => {
    const bucketingConfig = await getBucketedConfig(
        serverSDKKey,
        user,
        null,
        options.configSource,
        !!options.enableObfuscation,
        !!options.enableEdgeDB,
    )
    return {
        _devcycleSSR: {
            bucketedConfig: bucketingConfig.config,
            sdkKey: clientSDKKey,
            user,
            userAgent: null,
        },
    }
}
