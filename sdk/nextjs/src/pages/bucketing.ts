import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { BucketedUserConfig, ConfigBody, ConfigSource } from '@devcycle/types'

const getFetchUrl = (sdkKey: string, obfuscated: boolean) =>
    `https://config-cdn.devcycle.com/config/v1/server/bootstrap/${
        obfuscated ? 'obfuscated/' : ''
    }${sdkKey}.json`

export const fetchCDNConfig = async (
    sdkKey: string,
    obfuscated: boolean,
): Promise<Response> => {
    return await fetch(getFetchUrl(sdkKey, obfuscated))
}

class CDNConfigSource extends ConfigSource {
    async getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
    ): Promise<{
        config: ConfigBody
        lastModified: string | null
        metaData: Record<string, unknown>
    }> {
        const configResponse = await fetchCDNConfig(sdkKey, obfuscated)
        if (!configResponse.ok) {
            throw new Error('Could not fetch config')
        }
        return {
            config: await configResponse.json(),
            lastModified: configResponse.headers.get('last-modified'),
            metaData: {},
        }
    }

    // implement a dummy version of this to satisfy shared type definition. Next does not use this method
    getConfigURL(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
    ): string {
        return ''
    }
}

const cdnConfigSource = new CDNConfigSource()

export const getBucketedConfig = async (
    sdkKey: string,
    user: DevCycleUser,
    userAgent: string | null,
    obfuscated: boolean,
    configSource: ConfigSource = cdnConfigSource,
): Promise<{ config: BucketedUserConfig }> => {
    const { config } = await configSource.getConfig(
        sdkKey,
        'bootstrap',
        obfuscated,
        '',
        true,
    )
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
                url: config.sse
                    ? new URL(config.sse.path, config.sse.hostname).toString()
                    : undefined,
                inactivityDelay: 1000 * 60 * 2,
            },
        },
    }
}
