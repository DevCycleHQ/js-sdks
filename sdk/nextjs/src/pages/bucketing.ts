import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { sseURlGetter } from '../server/ably.js'
import { BucketedUserConfig } from '@devcycle/types'

const getFetchUrl = (sdkKey: string) =>
    `https://config-cdn.devcycle.com/config/v1/client/${sdkKey}.json`

export const fetchCDNConfig = async (sdkKey: string): Promise<Response> => {
    return await fetch(getFetchUrl(sdkKey))
}

export const getBucketedConfig = async (
    sdkKey: string,
    user: DevCycleUser,
    userAgent: string | null,
): Promise<{ config: BucketedUserConfig }> => {
    const configResponse = await fetchCDNConfig(sdkKey)
    if (!configResponse.ok) {
        throw new Error('Could not fetch config')
    }
    const config = await configResponse.json()
    const populatedUser = new DVCPopulatedUser(
        user,
        {},
        undefined,
        undefined,
        userAgent ?? undefined,
    )

    const bucketedConfig = generateBucketedConfig({
        user: populatedUser,
        config,
    })

    for (const feature of Object.values(bucketedConfig.features)) {
        if (feature.settings === undefined) {
            // next complains about not being able to serialize explicitly undefined values
            delete feature.settings
        }
    }

    return {
        config: {
            ...bucketedConfig,
            sse: {
                url: await sseURlGetter(sdkKey, config.ably?.apiKey)(),
                inactivityDelay: 1000 * 60 * 2,
            },
        },
    }
}
