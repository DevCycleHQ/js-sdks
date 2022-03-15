import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'
import { DVCLogger } from './types'
import { SDKEventBatchRequestBody } from '@devcycle/types'

const axiosClient = axios.create({
    validateStatus: (status: number) => status < 400 && status >= 200,
})
export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

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
