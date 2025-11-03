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
        const response = await fetch(
            getFetchUrl(sdkKey, obfuscated),
            // only store for 60 seconds
            {
                next: {
                    revalidate: 60,
                    tags: [sdkKey, clientSDKKey],
                },
            },
        )

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

export const hasOptInEnabled = cache(
    async (userId: string, sdkKey: string): Promise<boolean> => {
        const response = await fetch(
            `https://sdk-api.devcycle.com/v1/optIns/${encodeURIComponent(
                userId,
            )}/hasEnabled?sdkKey=${sdkKey}`,
            {
                next: {
                    revalidate: 3600,
                    tags: [`optin-${sdkKey}`],
                },
            },
        )
        const status = response.status
        if (status === 200) {
            return true
        } else if (status === 204) {
            return false
        } else {
            throw new Error(`Unexpected status code: ${status}`)
        }
    },
)

const getSDKAPIUrl = (
    sdkKey: string,
    obfuscated: boolean,
    enableEdgeDB: boolean,
    user: DVCPopulatedUser,
) => {
    const searchParams = new URLSearchParams()
    serializeUserSearchParams(user, searchParams)
    searchParams.set('sdkKey', sdkKey)
    if (obfuscated) {
        searchParams.set('obfuscated', '1')
    }
    if (enableEdgeDB) {
        searchParams.set('enableEdgeDB', 'true')
    }
    searchParams.set('sdkPlatform', 'nextjs')
    searchParams.set('sse', '1')
    return `https://sdk-api.devcycle.com/v1/sdkConfig?${searchParams.toString()}`
}

export const sdkConfigAPI = cache(
    async (
        sdkKey: string,
        user: DVCPopulatedUser,
        obfuscated: boolean,
        enableEdgeDB: boolean,
    ): Promise<BucketedUserConfig> => {
        const response = await fetch(
            getSDKAPIUrl(sdkKey, obfuscated, enableEdgeDB, user),
            {
                next: {
                    revalidate: 60,
                    tags: [sdkKey, user.user_id],
                },
            },
        )

        return (await response.json()) as BucketedUserConfig
    },
)
