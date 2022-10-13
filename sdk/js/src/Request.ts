import { DVCEvent, DVCOptions } from './types'
import { DVCPopulatedUser } from './User'
import { serializeUser, generateEventPayload } from './utils'
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import { BucketedUserConfig, DVCLogger } from '@devcycle/types'

const axiosClient = axios.create({
    timeout: 10 * 1000,
    validateStatus: (status: number) => status < 400 && status >= 200,
})
axiosRetry(axiosClient, {
    // will do exponential retry until axios.timeout
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return !error.response || (error.response.status || 0) >= 500
    }
})

export const HOST = '.devcycle.com'
export const CLIENT_SDK_URL = 'https://sdk-api' + HOST
export const EVENT_URL = 'https://events' + HOST

export const CONFIG_PATH = '/v1/sdkConfig'
export const EVENTS_PATH = '/v1/events'
export const SAVE_ENTITY_PATH = '/v1/edgedb'

export const baseRequestHeaders = (environmentKey?: string): AxiosRequestHeaders => {
    return {
        'Content-Type': 'application/json',
        ...(environmentKey ? { 'Authorization': environmentKey } : {})
    }
}

/**
 * Base Requests
 */
export const get = async (url: string): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'GET',
        url: `${url}`,
        headers: baseRequestHeaders()
    })
}

export const post = async (
    url: string,
    environmentKey: string,
    body: Record<string, unknown>
): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'POST',
        url,
        data: body,
        headers: baseRequestHeaders(environmentKey)
    })
}

export const patch = async (
    url: string,
    environmentKey: string,
    body: Record<string, unknown>
): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'PATCH',
        url,
        data: body,
        headers: baseRequestHeaders(environmentKey)
    })
}

/**
 * Endpoints
 */
export const getConfigJson = async (
    environmentKey: string,
    user: DVCPopulatedUser,
    logger: DVCLogger,
    options?: DVCOptions,
    sse?: boolean
): Promise<BucketedUserConfig> => {
    const edgeDBParam = options?.enableEdgeDB ? ('&enableEdgeDB=' + options.enableEdgeDB): ''
    const sseParam = sse ? '&sse=1' : ''
    const queryParams = `${serializeUser(user)}${edgeDBParam}${sseParam}`
    const url = `${options?.apiProxyURL || CLIENT_SDK_URL}${CONFIG_PATH}` +
                `?envKey=${environmentKey}${queryParams && '&' + queryParams}`

    try {
        const res = await get(url)
        return res.data
    } catch (ex: any) {
        logger.error(`Request to get config failed for url: ${url}, ` +
            `response message: ${ex.message}, response data: ${ex?.response?.data}`)
        throw new Error('Failed to download DevCycle config.')
    }
}

export const publishEvents = async (
    envKey: string | null,
    config: BucketedUserConfig | null,
    user: DVCPopulatedUser,
    events: DVCEvent[],
    logger: DVCLogger,
    options?: DVCOptions
): Promise<AxiosResponse> => {
    if (!envKey) {
        throw new Error('Missing envKey to publish events to Events API')
    }

    const payload = generateEventPayload(config, user, events)
    logger.info(`Submit Events Payload: ${JSON.stringify(payload)}`)

    const res = await post(
        `${options?.apiProxyURL || EVENT_URL}${EVENTS_PATH}`,
        envKey,
        payload as unknown as Record<string, unknown>
    )
    if (res.status >= 400) {
        logger.error(`Error posting events, status: ${res.status}, body: ${res.data}`)
    } else {
        logger.info(`Posted Events, status: ${res.status}, body: ${res.data}`)
    }

    return res
}

export const saveEntity = async (
    user: DVCPopulatedUser,
    envKey: string,
    logger: DVCLogger,
    options?: DVCOptions
): Promise<AxiosResponse> => {
    if (!envKey) {
        throw new Error('Missing envKey to save to Edge DB!')
    }

    if (!user || !user.user_id) {
        throw new Error('Missing user to save to Edge DB!')
    }

    if (user.isAnonymous) {
        throw new Error('Cannot save user data for an anonymous user!')
    }

    const res = await patch(
        `${options?.apiProxyURL || CLIENT_SDK_URL}${SAVE_ENTITY_PATH}/${encodeURIComponent(user.user_id)}`,
        envKey,
        user as unknown as Record<string, unknown>
    )

    if (res.status === 403) {
        logger.warn('Warning: EdgeDB feature is not enabled for this project')
    } else if (res.status >= 400) {
        logger.error(`Error saving user entity, status: ${res.status}, body: ${res.data}`)
    } else {
        logger.info(`Saved user entity, status: ${res.status}, body: ${res.data}`)
    }
    return res
}

export default {
    get,
    post,
    getConfigJson,
    publishEvents
}
