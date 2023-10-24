import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { getIdentity } from './requestContext'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { headers } from 'next/headers'

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
                sse: config.sse,
            },
            populatedUser,
        }
    },
)

/**
 * Retrieve the config from CDN for the current request's SDK Key. This data will often be cached
 * Compute the bucketed config for the current request's user using that data, with local bucketing library
 * Cache the bucketed config for this request so that repeated calls to this function are memoized
 * @param lastModified
 */
export const getBucketedConfig = async (lastModified?: string) => {
    // this request will be cached by Next
    const cdnConfig = await fetchCDNConfig(lastModified)
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
