import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import {
    BucketedConfigWithAdditionalFields,
    DevCycleNextOptions,
} from '../common/types'
import { ConfigSource } from '../common/ConfigSource'
import { ConfigBody } from '@devcycle/types'

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = cache(
    async (
        sdkKey: string,
        user: DevCycleUser,
        config: ConfigBody,
        userAgent?: string,
    ) => {
        const populatedUser = new DVCPopulatedUser(
            user,
            {},
            undefined,
            undefined,
            userAgent ?? undefined,
        )
        return {
            bucketedConfig: {
                ...generateBucketedConfig({ user: populatedUser, config }),
                // clientSDKKey is always defined for bootstrap config
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                clientSDKKey: config.clientSDKKey!,
                sse: {
                    url: config.sse
                        ? `${config.sse.hostname}${config.sse.path}`
                        : undefined,
                    inactivityDelay: 1000 * 60 * 2,
                },
            },
        }
    },
)

class CDNConfigSource extends ConfigSource {
    constructor(private clientSDKKey: string) {
        super()
    }
    async getConfig(sdkKey: string, kind: string, obfuscated: boolean) {
        // this request will be cached by Next
        const cdnConfig = await fetchCDNConfig(
            sdkKey,
            this.clientSDKKey,
            obfuscated,
        )
        if (!cdnConfig.ok) {
            const responseText = await cdnConfig.text()
            throw new Error('Could not fetch config: ' + responseText)
        }
        return {
            config: await cdnConfig.json(),
            lastModified: cdnConfig.headers.get('last-modified'),
        }
    }
}

/**
 * Retrieve the config from CDN for the current request's SDK Key. This data will often be cached
 * Compute the bucketed config for the current request's user using that data, with local bucketing library
 * Cache the bucketed config for this request so that repeated calls to this function are memoized
 */
export const getBucketedConfig = async (
    sdkKey: string,
    clientSDKKey: string,
    user: DevCycleUser,
    options: DevCycleNextOptions,
    userAgent?: string,
): Promise<BucketedConfigWithAdditionalFields> => {
    const cdnConfigSource = new CDNConfigSource(clientSDKKey)

    const configSource = options.configSource ?? cdnConfigSource
    const { config, lastModified } = await configSource.getConfig(
        sdkKey,
        'bootstrap',
        !!options.enableObfuscation,
    )

    const { bucketedConfig } = await generateBucketedConfigCached(
        sdkKey,
        user,
        config,
        userAgent,
    )

    return {
        ...bucketedConfig,
        lastModified: lastModified ?? undefined,
    }
}
