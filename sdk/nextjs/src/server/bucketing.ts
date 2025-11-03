import { fetchCDNConfig, hasOptInEnabled, sdkConfigAPI } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { cache } from 'react'
import { DevCycleUser, DVCPopulatedUser } from '@devcycle/js-client-sdk'
import {
    BucketedConfigWithAdditionalFields,
    DevCycleNextOptions,
} from '../common/types'
import { ConfigBody, ConfigSource } from '@devcycle/types'

export const getPopulatedUser = cache(
    (user: DevCycleUser, userAgent?: string) => {
        return new DVCPopulatedUser(
            user,
            {},
            undefined,
            undefined,
            userAgent ?? undefined,
        )
    },
)

const checkOptInEnabled = async (
    config: ConfigBody,
    user: DVCPopulatedUser,
    clientSDKKey: string,
) => {
    if (!config.project.settings.optIn?.enabled) {
        return false
    }
    return await hasOptInEnabled(user.user_id, clientSDKKey)
}

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = cache(
    async (
        user: DevCycleUser,
        config: ConfigBody,
        obfuscated: boolean,
        enableEdgeDB: boolean,
        userAgent?: string,
    ) => {
        const populatedUser = getPopulatedUser(user, userAgent)

        // clientSDKKey is always defined for bootstrap config
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const clientSDKKey = config.clientSDKKey!

        if (enableEdgeDB && !config.project.settings.edgeDB.enabled) {
            console.warn(
                'EdgeDB is not enabled for this project. Only using local user data.',
            )
        }
        const useEdgeDB = config.project.settings.edgeDB.enabled && enableEdgeDB
        const useOptIn = await checkOptInEnabled(
            config,
            populatedUser,
            clientSDKKey,
        )

        if (
            config.debugUsers?.includes(user.user_id ?? '') ||
            useEdgeDB ||
            useOptIn
        ) {
            const bucketedConfigResponse = await sdkConfigAPI(
                clientSDKKey,
                populatedUser,
                obfuscated,
                useEdgeDB,
            )

            return {
                bucketedConfig: {
                    ...bucketedConfigResponse,
                    clientSDKKey,
                },
            }
        }

        return {
            bucketedConfig: {
                ...generateBucketedConfig({
                    user: populatedUser,
                    config,
                }),
                clientSDKKey,
                sse: {
                    url: config.sse
                        ? `${config.sse.hostname}${config.sse.path}`
                        : undefined,
                    inactivityDelay: 1000 * 60 * 2,
                },
            },
        }
    },
)

class CDNConfigSource extends ConfigSource {
    constructor(private clientSDKKey: string) {
        super()
    }
    async getConfig(sdkKey: string, kind: string, obfuscated: boolean) {
        // this request will be cached by Next
        const { config, headers } = await fetchCDNConfig(
            sdkKey,
            this.clientSDKKey,
            obfuscated,
        )
        return {
            config,
            lastModified: headers.get('last-modified'),
            metaData: {},
        }
    }

    // dummy implementation to make types happy, this method isn't used in Next
    getConfigURL(): string {
        return ''
    }
}

export const getConfigFromSource = async (
    sdkKey: string,
    clientSDKKey: string,
    options: DevCycleNextOptions,
): Promise<{ config: ConfigBody; lastModified: string | null }> => {
    const cdnConfigSource = new CDNConfigSource(clientSDKKey)
    const configSource = options.configSource ?? cdnConfigSource

    const { config, lastModified } = await configSource.getConfig(
        sdkKey,
        'bootstrap',
        !!options.enableObfuscation,
        '',
        true,
    )

    return { config, lastModified }
}

/**
 * Compute the bucketed config for the current request's user using raw config data, with local bucketing library
 * Cache the bucketed config for this request so that repeated calls to this function are memoized
 */
export const getBucketedConfig = async (
    config: ConfigBody,
    lastModified: string | null,
    user: DevCycleUser,
    options: DevCycleNextOptions,
    userAgent?: string,
): Promise<BucketedConfigWithAdditionalFields> => {
    const { bucketedConfig } = await generateBucketedConfigCached(
        user,
        config,
        !!options.enableObfuscation,
        !!options.enableEdgeDB,
        userAgent,
    )
    return {
        ...bucketedConfig,
        lastModified: lastModified ?? undefined,
    }
}
