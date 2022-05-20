import { DVCFeatureSet, DVCVariableSet, DVCEvent, DVCUser } from './types'
import { DVCPopulatedUser } from './User'
import { serializeUser, generateEventPayload } from './utils'
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import { BucketedUserConfig } from '@devcycle/types'

const axiosClient = axios.create({
    validateStatus: (status: number) => status < 400 && status >= 200,
})
axiosRetry(axiosClient, {
    retries: 5,
    retryDelay: (retryCount) => {
        return Math.pow(2, retryCount) * 1000
    },
    retryCondition: (error) => {
        return (error?.response?.status || 0) >= 500
    }
})

export const HOST = '.devcycle.com'
export const BASE_URL = 'https://sdk-api'
export const EVENT_URL = 'https://events'

export const CONFIG_PATH = '/v1/sdkConfig'
export const EVENTS_PATH = '/v1/events'
export const SAVE_ENTITY_PATH = '/v1/edgedb'

export const baseRequestHeaders = (environmentKey?: string): AxiosRequestHeaders => {
    return {
        'Content-Type': 'application/json',
        ...(environmentKey ? { 'Authorization': environmentKey } : {})
    }
}

export const get = async (url: string): Promise<AxiosResponse> => {
    return await axiosClient.request({
        method: 'GET',
        url: `${url}`,
        headers: baseRequestHeaders()
    })
}

export const getConfigJson = async (
    environmentKey: string,
    user: DVCPopulatedUser,
    enableEdgeDB?: boolean
): Promise<BucketedUserConfig> => {
    const queryParams = `${serializeUser(user)}${enableEdgeDB ? ('&enableEdgeDB=' + enableEdgeDB): ''}`
    const url = `${BASE_URL}${HOST}${CONFIG_PATH}?envKey=${environmentKey}${queryParams && '&' + queryParams}`

    try {
        const res = await get(url)
        return res.data
    } catch (ex: any) {
        console.error(`Request to get config failed for url: ${url}, ` +
            `response message: ${ex.message}, response data: ${ex?.response?.data}`)
        throw new Error('Failed to download DevCycle config.')
    }
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

export const publishEvents = async (
    envKey: string | null,
    config: BucketedUserConfig | null,
    user: DVCPopulatedUser,
    events: DVCEvent[]
): Promise<AxiosResponse> => {
    if (!envKey) {
        throw new Error('Missing envKey to publish events to Events API')
    }

    const payload = generateEventPayload(config, user, events)
    console.log(`Submit Events Payload: ${JSON.stringify(payload)}`)

    const res = await post(
        `${EVENT_URL}${HOST}${EVENTS_PATH}`,
        envKey,
        payload as unknown as Record<string, unknown>
    )
    if (res.status >= 400) {
        console.error(`Error posting events, status: ${res.status}, body: ${res.data}`)
    } else {
        console.log(`Posted Events, status: ${res.status}, body: ${res.data}`)
    }

    return res
}

export const saveEntity = async (user: DVCUser, envKey: string): Promise<AxiosResponse> => {
    if (!envKey) {
        throw new Error('Missing envKey to save to Edge DB!')
    }

    if (!user || !user.user_id) {
        throw new Error('Missing user to save to Edge DB!')
    }

    const res = await patch(
        `${BASE_URL}${HOST}${SAVE_ENTITY_PATH}/${user.user_id}`,
        envKey,
        user as unknown as Record<string, unknown>
    )
    if (res.status >= 400) {
        console.error(`Error saving user entity, status: ${res.status}, body: ${res.data}`)
    } else {
        console.log(`Saved user entity, status: ${res.status}, body: ${res.data}`)
    }
    return res
}

export default {
    get,
    post,
    getConfigJson,
    publishEvents
}
