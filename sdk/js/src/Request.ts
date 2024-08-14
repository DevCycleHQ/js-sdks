import { DevCycleEvent, DevCycleOptions } from './types'
import { DVCPopulatedUser } from './User'
import {
    serializeUserSearchParams,
    generateEventPayload,
    UserError,
} from './utils'
import type { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import {
    ResponseError,
    exponentialBackoff,
    getWithTimeout,
    post,
    patch,
} from './RequestUtils'
import { RequestInitWithRetry } from 'fetch-retry'

const HOST = '.devcycle.com'
const CLIENT_SDK_URL = 'https://sdk-api' + HOST
const EVENT_URL = 'https://events' + HOST

const CONFIG_PATH = '/v1/sdkConfig'
const EVENTS_PATH = '/v1/events'
const SAVE_ENTITY_PATH = '/v1/edgedb'

const requestConfig: RequestInitWithRetry = {
    retries: 5,
    retryDelay: exponentialBackoff,
}

/**
 * Endpoints
 */
export const getConfigJson = async (
    sdkKey: string,
    user: DVCPopulatedUser,
    logger: DVCLogger,
    options?: DevCycleOptions,
    extraParams?: { sse: boolean; lastModified?: number; etag?: string },
): Promise<BucketedUserConfig> => {
    const queryParams = new URLSearchParams({ sdkKey })
    serializeUserSearchParams(user, queryParams)
    if (options?.enableEdgeDB) {
        queryParams.append('enableEdgeDB', options.enableEdgeDB.toString())
    }
    if (extraParams?.sse) {
        queryParams.append('sse', '1')
        if (extraParams.lastModified) {
            queryParams.append(
                'sseLastModified',
                extraParams.lastModified.toString(),
            )
        }
        if (extraParams.etag) {
            queryParams.append('sseEtag', extraParams.etag)
        }
    }
    if (options?.enableObfuscation) {
        queryParams.append('obfuscated', '1')
    }
    if (options?.sdkPlatform) {
        queryParams.append('sdkPlatform', options.sdkPlatform)
    }

    const url =
        `${options?.apiProxyURL || CLIENT_SDK_URL}${CONFIG_PATH}?` +
        queryParams.toString()

    try {
        const res = await getWithTimeout(url, requestConfig, 5000)
        return await res.json()
    } catch (e) {
        logger.error(
            `Request to get config failed for url: ${url}, ` +
                `response message: ${e}`,
        )

        if (e instanceof ResponseError) {
            if (e.status === 401 || e.status === 403) {
                throw new UserError(
                    `Invalid SDK Key. Error details: ${e.message}`,
                )
            }

            throw new Error(
                `Failed to download DevCycle config. Error details: ${e.message}`,
            )
        }

        throw new Error(
            `Failed to download DevCycle config. Error details: ${e}`,
        )
    }
}

export const publishEvents = async (
    sdkKey: string | null,
    config: BucketedUserConfig | null,
    user: DVCPopulatedUser,
    events: DevCycleEvent[],
    logger: DVCLogger,
    options?: DevCycleOptions,
): Promise<Response> => {
    if (!sdkKey) {
        throw new Error('Missing sdkKey to publish events to Events API')
    }

    const payload = generateEventPayload(config, user, events)
    logger.info(`Submit Events Payload: ${JSON.stringify(payload)}`)

    let url = `${options?.apiProxyURL || EVENT_URL}${EVENTS_PATH}`
    if (options?.enableObfuscation) {
        url += '?obfuscated=1'
    }

    const res = await post(
        url,
        {
            ...requestConfig,
            body: JSON.stringify(payload),
        },
        sdkKey,
    )
    const data = await res.json()
    if (res.status >= 400) {
        logger.error(
            `Error posting events, status: ${res.status}, body: ${data}`,
        )
    } else {
        logger.info(`Posted Events, status: ${res.status}, body: ${data}`)
    }

    return res
}

export const saveEntity = async (
    user: DVCPopulatedUser,
    sdkKey: string,
    logger: DVCLogger,
    options?: DevCycleOptions,
): Promise<Response | undefined> => {
    if (!sdkKey) {
        throw new Error('Missing sdkKey to save to Edge DB!')
    }
    if (!user || !user.user_id) {
        throw new Error('Missing user to save to Edge DB!')
    }
    if (user.isAnonymous) {
        throw new Error('Cannot save user data for an anonymous user!')
    }
    try {
        return await patch(
            `${
                options?.apiProxyURL || CLIENT_SDK_URL
            }${SAVE_ENTITY_PATH}/${encodeURIComponent(user.user_id)}`,
            {
                ...requestConfig,
                body: JSON.stringify(user),
            },
            sdkKey,
        )
    } catch (e) {
        const error = e as ResponseError
        if (error.status === 403) {
            logger.warn(
                'Warning: EdgeDB feature is not enabled for this project',
            )
        } else if (error.status >= 400) {
            logger.warn(
                `Error saving user entity, status: ${error.status}, body: ${error.message}`,
            )
        } else {
            logger.info(
                `Saved user entity, status: ${error.status}, body: ${error.message}`,
            )
        }
        return
    }
}
