import { SSRProps } from './types'
import { DevCycleOptions, DevCycleUser } from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing.js'
import { GetServerSidePropsContext } from 'next'
import { BucketedUserConfig } from '@devcycle/types'
import { ConfigSource } from '../common/ConfigSource.js'

type IdentifiedUser = Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & {
    user_id: string
}

type DevCycleServersideOptions = Pick<DevCycleOptions, 'enableObfuscation'> & {
    configSource?: ConfigSource
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
    const userAgent = context.req.headers['user-agent'] ?? null
    let bucketedConfig: BucketedUserConfig | null = null
    try {
        const bucketingConfigResult = await getBucketedConfig(
            serverSDKKey,
            user,
            userAgent,
            !!options.enableObfuscation,
            options.configSource,
        )
        bucketedConfig = bucketingConfigResult.config
    } catch (e) {
        console.error('DevCycle: Error getting user config')
        // no-op
    }
    return {
        _devcycleSSR: {
            bucketedConfig,
            user,
            sdkKey: clientSDKKey,
            userAgent,
        },
    }
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
        !!options.enableObfuscation,
        options.configSource,
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
