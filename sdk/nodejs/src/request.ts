import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'
import { SDKEventBatchRequestBody, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCEvent } from './types'

const axiosClient = axios.create({
    validateStatus: (status: number) => status < 400 && status >= 200,
})
export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

const BUCKETING_URL = 'https://bucketing-api'
const VARIABLES_PATH = '/v1/variables'
const FEATURES_PATH = '/v1/features'
const TRACK_PATH = '/v1/track'

export async function publishEvents(
    logger: DVCLogger,
    envKey: string | null,
    eventsBatch: SDKEventBatchRequestBody
): Promise<AxiosResponse> {
    if (!envKey) {
        throw new Error('DevCycle is not yet initialized to publish events.')
    }

    const res = await post({
        url: `${EVENT_URL}${HOST}${EVENTS_PATH}`,
        headers: { 'Authorization': envKey },
        data: { batch: eventsBatch }
    })
    if (res.status !== 201) {
        logger.error(`Error posting events, status: ${res.status}, body: ${res.data?.message}`)
    } else {
        logger.debug(`Posted Events, status: ${res.status}, body: ${res.data?.message}`)
    }

    return res
}

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string
): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {}
    if (etag) {
        headers['If-None-Match'] = etag
    }
    return await get({
        url,
        timeout: requestTimeout,
        headers: headers
    })
}

export async function getAllFeatures(user: DVCPopulatedUser, envKey: string): Promise<AxiosResponse> {
    return await post({
        url: `${BUCKETING_URL}${HOST}${FEATURES_PATH}`,
        headers: { 'Authorization': envKey },
        data: user
    })
}

export async function getAllVariables(user: DVCPopulatedUser, envKey: string): Promise<AxiosResponse> {
    return await post({
        url: `${BUCKETING_URL}${HOST}${VARIABLES_PATH}`,
        headers: { 'Authorization': envKey },
        data: user
    })
}

export async function getVariable(user: DVCPopulatedUser, envKey: string, variableKey: string): Promise<AxiosResponse> {
    return await post({
        url: `${BUCKETING_URL}${HOST}${VARIABLES_PATH}/${variableKey}`,
        headers: { 'Authorization': envKey },
        data: user
    })
}

    export async function postTrack(
        user: DVCPopulatedUser,
        event: DVCEvent,
        envKey: string,
        logger: DVCLogger
    ): Promise<void> {
    try {
        const res = await post({
            url: `${BUCKETING_URL}${HOST}${TRACK_PATH}`,
            headers: { 'Authorization': envKey },
            data: {
                user,
                events: [event]
            }
        })
        if (res.status !== 201) {
            throw new Error(`Error tracking event, status: ${res.status}, body: ${res.data}`)
        } else {
            logger.debug(`DVC Event Tracked`)
        }
    } catch (ex) {
        logger.error(`DVC Error Tracking Event. Response message: ${ex.message}`)
    }

}

export async function post(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axiosClient.request({
        ...requestConfig,
        method: 'POST'
    })
}

export async function get(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axiosClient.request({
        ...requestConfig,
        method: 'GET'
    })
}
