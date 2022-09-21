import { SDKEventBatchRequestBody, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCEvent, DVCOptions } from './types'
import nodeFetch, { Response as NodeFetchResponse } from 'node-fetch-cjs'

export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

const BUCKETING_BASE = 'https://bucketing-api'
const VARIABLES_PATH = '/v1/variables'
const FEATURES_PATH = '/v1/features'
const TRACK_PATH = '/v1/track'
const BUCKETING_URL = `${BUCKETING_BASE}${HOST}`
const EDGE_DB_QUERY_PARAM = '?enableEdgeDB='

type RequestConfig = (Pick<RequestInit, 'signal'> & {
    body?: string
    headers?: Record<string, string>
}) | undefined

export type FetchResponse = Response | NodeFetchResponse

export async function publishEvents(
    logger: DVCLogger,
    envKey: string | null,
    eventsBatch: SDKEventBatchRequestBody
): Promise<FetchResponse> {
    if (!envKey) {
        throw new Error('DevCycle is not yet initialized to publish events.')
    }

    const eventUrl = `${EVENT_URL}${HOST}${EVENTS_PATH}`
    return await post(eventUrl, {
        body: JSON.stringify({ batch: eventsBatch })
    }, envKey)
}

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string
): Promise<FetchResponse> {
    const headers: Record<string, string> = {}

    if (etag) {
        headers['If-None-Match'] = etag
    }

    return await getWithTimeout(url, {
        headers: headers
    }, requestTimeout)
}

export async function getAllFeatures(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<FetchResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${FEATURES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        body: JSON.stringify(user)
    }, envKey)
}

export async function getAllVariables(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<FetchResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${VARIABLES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    }, envKey)
}

export async function getVariable(
    user: DVCPopulatedUser,
    envKey: string,
    variableKey: string,
    options: DVCOptions
): Promise<FetchResponse> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${VARIABLES_PATH}/${variableKey}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        body: JSON.stringify(user)
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
        await post(postUrl, {
            body: JSON.stringify({
                user,
                events: [event]
            })
        }, envKey)
        logger.debug('DVC Event Tracked')
    } catch (ex) {
        logger.error(`DVC Error Tracking Event. Response message: ${ex.message}`)
    }
}

export async function post(url: string, requestConfig: RequestConfig, envKey: string): Promise<FetchResponse> {
    const _fetch = await getFetch()
    const headers = { ...requestConfig?.headers, 'Authorization': envKey }
    return await _fetch(url, {
        ...requestConfig,
        headers,
        method: 'POST'
    })
}

export async function get(url: string, requestConfig?: RequestConfig): Promise<FetchResponse> {
    const _fetch = await getFetch()

    return _fetch(url, {
        ...requestConfig,
        method: 'GET'
    })
}

async function getWithTimeout(url: string, requestConfig: RequestConfig, timeout: number): Promise<FetchResponse> {
    const controller = new AbortController()
    const id = setTimeout(() => {
        controller.abort()
    }, timeout)
    const response = await get(url, {
        ...requestConfig,
        signal: controller.signal
    })
    clearTimeout(id)
    return response
}

function getFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch
    }

    return nodeFetch
}
