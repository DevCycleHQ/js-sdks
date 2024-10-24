import { DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { serializeUserSearchParams } from '../common/serializeUser'
import { cache } from 'react'
import { BucketedUserConfig } from '@devcycle/types'

const getFetchUrl = (sdkKey: string, obfuscated: boolean) =>
    `https://config-cdn.devcycle.com/config/v2/server/bootstrap/${
        obfuscated ? 'obfuscated/' : ''
    }${sdkKey}.json`

export const fetchCDNConfig = async (
    sdkKey: string,
    clientSDKKey: string,
    obfuscated: boolean,
): Promise<Response> => {
    return await fetch(
        getFetchUrl(sdkKey, obfuscated),
        // only store for 60 seconds
        {
            next: {
                revalidate: 60,
                tags: [sdkKey, clientSDKKey],
            },
        },
    )
}

const getSDKAPIUrl = (
    sdkKey: string,
    obfuscated: boolean,
    user: DVCPopulatedUser,
) => {
    const searchParams = new URLSearchParams()
    serializeUserSearchParams(user, searchParams)
    searchParams.set('sdkKey', sdkKey)
    if (obfuscated) {
        searchParams.set('obfuscated', '1')
    }
    searchParams.set('sdkPlatform', 'nextjs')
    searchParams.set('sse', '1')
    return `https://sdk-api.devcycle.com/v1/sdkConfig?${searchParams.toString()}`
}

export const sdkConfigAPI = cache(
    async (
        sdkKey: string,
        obfuscated: boolean,
        user: DVCPopulatedUser,
    ): Promise<BucketedUserConfig> => {
        const response = await fetch(getSDKAPIUrl(sdkKey, obfuscated, user), {
            next: {
                revalidate: 60,
                tags: [sdkKey, user.user_id],
            },
        })

        return (await response.json()) as BucketedUserConfig
    },
)
