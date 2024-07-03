import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import {
    BucketedConfigWithAdditionalFields,
    DevCycleNextOptions,
} from '../common/types'

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = cache(
    async (
        sdkKey: string,
        user: DevCycleUser,
        configResponse: Response,
        userAgent?: string,
    ) => {
        const config = await configResponse.json()
        const populatedUser = new DVCPopulatedUser(
            user,
            {},
            undefined,
            undefined,
            userAgent ?? undefined,
        )
        return {
            config: {
                ...generateBucketedConfig({ user: populatedUser, config }),
                clientSDKKey: config.clientSDKKey,
                sse: {
                    url: config.sse.hostname + config.sse.path,
                    inactivityDelay: 1000 * 60 * 2,
                },
            },
        }
    },
)

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
    // this request will be cached by Next
    const cdnConfig = await fetchCDNConfig(sdkKey, clientSDKKey, options)
    if (!cdnConfig.ok) {
        const responseText = await cdnConfig.text()
        throw new Error('Could not fetch config: ' + responseText)
    }

    const { config } = await generateBucketedConfigCached(
        sdkKey,
        user,
        cdnConfig,
        userAgent,
    )

    return {
        ...config,
        lastModified: cdnConfig.headers.get('last-modified') ?? undefined,
    }
}
