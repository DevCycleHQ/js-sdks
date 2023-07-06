import { DevCycleClientEvent, DevCycleOptions } from './types'
import { DVCPopulatedUser } from './User'
import { serializeUserSearchParams, generateEventPayload } from './utils'
import axios, { AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import { BucketedUserConfig, DVCLogger } from '@devcycle/types'

const axiosClient = axios.create({
    timeout: 5 * 1000,
    validateStatus: (status: number) => status < 400 && status >= 200,
})
axiosRetry(axiosClient, {
    retries: 5,
    // will do exponential retry until axios.timeout
    retryDelay: axiosRetry.exponentialDelay,
    shouldResetTimeout: true,
    retryCondition: (error) => {
        return !error.response || (error.response.status || 0) >= 500
    },
})

export const HOST = '.devcycle.com'
export const CLIENT_SDK_URL = 'https://sdk-api' + HOST
export const EVENT_URL = 'https://events' + HOST

export const CONFIG_PATH = '/v1/sdkConfig'
export const EVENTS_PATH = '/v1/events'
export const SAVE_ENTITY_PATH = '/v1/edgedb'

export const baseRequestHeaders = (sdkKey?: string): Record<string, string> => {
    return {
        'Content-Type': 'application/json',
        ...(sdkKey ? { Authorization: sdkKey } : {}),
    }
}

/**
 * Base Requests
 */
export const get = async (url: string): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'GET',
        url: `${url}`,
        headers: baseRequestHeaders(),
    })
}

export const post = async (
    url: string,
    sdkKey: string,
    body: Record<string, unknown>,
): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'POST',
        url,
        data: body,
        headers: baseRequestHeaders(sdkKey),
    })
}

export const patch = async (
    url: string,
    sdkKey: string,
    body: Record<string, unknown>,
): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'PATCH',
        url,
        data: body,
        headers: baseRequestHeaders(sdkKey),
    })
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
    const url =
        `${options?.apiProxyURL || CLIENT_SDK_URL}${CONFIG_PATH}?` +
        queryParams.toString()

    try {
        const res = await get(url)
        return res.data
    } catch (ex: any) {
        const errorString = JSON.stringify(ex?.response?.data?.data?.errors)
        logger.error(
            `Request to get config failed for url: ${url}, ` +
                `response message: ${ex.message}` +
                (errorString ? `, response data: ${errorString}` : ''),
        )
        throw new Error(
            `Failed to download DevCycle config.` +
                (errorString ? ` Error details: ${errorString}` : ''),
        )
    }
}

export const publishEvents = async (
    sdkKey: string | null,
    config: BucketedUserConfig | null,
    user: DVCPopulatedUser,
    events: DevCycleClientEvent[],
    logger: DVCLogger,
    options?: DevCycleOptions,
): Promise<AxiosResponse> => {
    if (!sdkKey) {
        throw new Error('Missing sdkKey to publish events to Events API')
    }

    const payload = generateEventPayload(config, user, events)
    logger.info(`Submit Events Payload: ${JSON.stringify(payload)}`)

    const res = await post(
        `${options?.apiProxyURL || EVENT_URL}${EVENTS_PATH}`,
        sdkKey,
        payload as unknown as Record<string, unknown>,
    )
    if (res.status >= 400) {
        logger.error(
            `Error posting events, status: ${res.status}, body: ${res.data}`,
        )
    } else {
        logger.info(`Posted Events, status: ${res.status}, body: ${res.data}`)
    }

    return res
}

export const saveEntity = async (
    user: DVCPopulatedUser,
    sdkKey: string,
    logger: DVCLogger,
    options?: DevCycleOptions,
): Promise<AxiosResponse> => {
    if (!sdkKey) {
        throw new Error('Missing sdkKey to save to Edge DB!')
    }
    if (!user || !user.user_id) {
        throw new Error('Missing user to save to Edge DB!')
    }
    if (user.isAnonymous) {
        throw new Error('Cannot save user data for an anonymous user!')
    }

    const res = await patch(
        `${
            options?.apiProxyURL || CLIENT_SDK_URL
        }${SAVE_ENTITY_PATH}/${encodeURIComponent(user.user_id)}`,
        sdkKey,
        user as unknown as Record<string, unknown>,
    )

    if (res.status === 403) {
        logger.warn('Warning: EdgeDB feature is not enabled for this project')
    } else if (res.status >= 400) {
        logger.warn(
            `Error saving user entity, status: ${res.status}, body: ${res.data}`,
        )
    } else {
        logger.info(
            `Saved user entity, status: ${res.status}, body: ${res.data}`,
        )
    }
    return res
}

export default {
    get,
    post,
    getConfigJson,
    publishEvents,
}
