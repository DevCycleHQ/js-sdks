import { DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { serializeUserSearchParams } from '../common/serializeUser'
import { cache } from 'react'
import { BucketedUserConfig, ConfigBody } from '@devcycle/types'
import { plainToInstance } from 'class-transformer'

const getFetchUrl = (sdkKey: string, obfuscated: boolean) =>
    `https://config-cdn.devcycle.com/config/v2/server/bootstrap/${
        obfuscated ? 'obfuscated/' : ''
    }${sdkKey}.json`

export const fetchCDNConfig = cache(
    async (
        sdkKey: string,
        clientSDKKey: string,
        obfuscated: boolean,
    ): Promise<{ config: ConfigBody; headers: Headers }> => {
        const url = getFetchUrl(sdkKey, obfuscated)
        const response = await fetch(url, {
            next: {
                revalidate: 60,
                tags: [sdkKey, clientSDKKey],
            },
        })

        if (!response.ok) {
            const responseText = await response.text()
            throw new Error('Could not fetch config: ' + responseText)
        }
        return {
            config: plainToInstance(ConfigBody, await response.json()),
            headers: response.headers,
        }
    },
)

const getAPIUrl = (path: string) => `https://sdk-api.devcycle.com/v1/${path}`

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
    return getAPIUrl(`sdkConfig?${searchParams.toString()}`)
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

export const getOptInUsersFromConfigApi = cache(
    async (sdkKey: string): Promise<string[]> => {
        const response = await fetch(getAPIUrl(`optIns/users?sdkKey=${sdkKey}`))
        if (!response.ok) {
            return []
        }
        return (await response.json()).users
    },
)
