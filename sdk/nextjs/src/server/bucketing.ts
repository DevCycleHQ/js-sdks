import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { getIdentity, getSDKKey } from './requestContext'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { headers } from 'next/headers'
import { getSSEUrl } from './ably'

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = cache(
    async (user: DevCycleUser, configResponse: Response) => {
        const config = await configResponse.json()
        const ua = headers().get('user-agent')
        const populatedUser = new DVCPopulatedUser(
            user,
            {},
            undefined,
            undefined,
            ua ?? undefined,
        )

        return {
            config: {
                ...generateBucketedConfig({ user: populatedUser, config }),
                sse: {
                    url: await getSSEUrl(getSDKKey(), config.ably?.apiKey),
                    inactivityDelay: 1000 * 60 * 2,
                },
            },
            populatedUser,
        }
    },
)

/**
 * Retrieve the config from CDN for the current request's SDK Key. This data will often be cached
 * Compute the bucketed config for the current request's user using that data, with local bucketing library
 * Cache the bucketed config for this request so that repeated calls to this function are memoized
 */
export const getBucketedConfig = async () => {
    // this request will be cached by Next
    const cdnConfig = await fetchCDNConfig()
    const user = getIdentity()
    if (!user) {
        throw Error('User must be set in cookie')
    }

    const { config, populatedUser } = await generateBucketedConfigCached(
        user,
        cdnConfig,
    )

    return {
        config: {
            ...config,
            lastModified: cdnConfig.headers.get('last-modified') ?? undefined,
        },
        user,
        populatedUser,
    }
}
