import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import { SDKEventBatchRequestBody, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCEvent, DVCOptions } from './types'

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
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

const BUCKETING_BASE = 'https://bucketing-api'
const VARIABLES_PATH = '/v1/variables'
const FEATURES_PATH = '/v1/features'
const TRACK_PATH = '/v1/track'
const BUCKETING_URL = `${BUCKETING_BASE}${HOST}`
const EDGE_DB_QUERY_PARAM = '?enableEdgeDB='

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
        data: { batch: eventsBatch }
    }, envKey)
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

export async function getAllFeatures(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<AxiosResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${FEATURES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post({
        url: postUrl,
        data: user
    }, envKey)
}

export async function getAllVariables(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<AxiosResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${VARIABLES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post({
        url: postUrl,
        headers: { 'Authorization': envKey, 'Content-Type': 'application/json' },
        data: user
    }, envKey)
}

export async function getVariable(
    user: DVCPopulatedUser,
    envKey: string,
    variableKey: string,
    options: DVCOptions
): Promise<AxiosResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${VARIABLES_PATH}/${variableKey}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post({
        url: postUrl,
        data: user
    }, envKey)
}

export async function postTrack(
    user: DVCPopulatedUser,
    event: DVCEvent,
    envKey: string,
    logger: DVCLogger,
    options: DVCOptions
): Promise<void> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${TRACK_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    try {
        await post({
            url: postUrl,
            data: {
                user,
                events: [event]
            }
        }, envKey)
        logger.debug('DVC Event Tracked')
    } catch (ex) {
        logger.error(`DVC Error Tracking Event. Response message: ${ex.message}`)
    }
}

export async function post(requestConfig: AxiosRequestConfig, envKey: string): Promise<AxiosResponse> {
    return await axiosClient.request({
        ...requestConfig,
        headers: { 'Authorization': envKey },
        method: 'POST'
    })
}

export async function get(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axiosClient.request({
        ...requestConfig,
        method: 'GET'
    })
}
