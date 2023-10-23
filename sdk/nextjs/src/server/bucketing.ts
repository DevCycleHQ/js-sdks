import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { getIdentity } from './context'
import { DVCBucketingUser } from '@devcycle/types'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { userAgent } from 'next/server'
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
        console.log('BUCKETING USER', populatedUser.user_id)
        return {
            config: {
                ...generateBucketedConfig({ user: populatedUser, config }),
                sse: config.sse,
            },
            populatedUser,
        }
    },
)

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
