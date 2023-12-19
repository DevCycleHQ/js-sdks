import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { getIdentity, getSDKKey } from './requestContext'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { sseURlGetter } from './ably'
import { getUserAgent } from './userAgent'
import { BucketedUserConfig } from '@devcycle/types'

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = cache(
    async (user: DevCycleUser, configResponse: Response) => {
        const config = await configResponse.json()
        const ua = getUserAgent()
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
                    url: await sseURlGetter(getSDKKey(), config.ably?.apiKey)(),
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
export const getBucketedConfig = async (): Promise<
    BucketedUserConfig & { lastModified?: string }
> => {
    // this request will be cached by Next
    const cdnConfig = await fetchCDNConfig(getSDKKey())
    const user = getIdentity()

    if (!user) {
        throw Error('User should be defined')
    }

    const { config } = await generateBucketedConfigCached(user, cdnConfig)

    return {
        ...config,
        lastModified: cdnConfig.headers.get('last-modified') ?? undefined,
    }
}
