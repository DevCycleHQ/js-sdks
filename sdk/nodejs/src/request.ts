import { SDKEventBatchRequestBody, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCEvent, DVCOptions } from './types'
import fetchWithRetry, { RequestInitWithRetry } from 'fetch-retry'

export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

const BUCKETING_BASE = 'https://bucketing-api'
const VARIABLES_PATH = '/v1/variables'
const FEATURES_PATH = '/v1/features'
const TRACK_PATH = '/v1/track'
const BUCKETING_URL = `${BUCKETING_BASE}${HOST}`
const EDGE_DB_QUERY_PARAM = '?enableEdgeDB='

export class ResponseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ResponseError'
    }

    status: number
}

const exponentialBackoff: RequestInitWithRetry['retryDelay'] = (
    attempt
) => {
    const delay = Math.pow(2, attempt) * 100
    const randomSum = delay * 0.2 * Math.random()
    return delay + randomSum
}

type retryOnRequestErrorFunc = (retries: number) => RequestInitWithRetry['retryOn']

const retryOnRequestError: retryOnRequestErrorFunc = (retries) => {
    return (attempt, error, response) => {
        if (attempt >= retries) {
            return false
        }

        if (response && response?.status < 500) {
            return false
        }

        return true
    }
}

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        let error
        try {
            error = new ResponseError((await res.clone().json()).message || 'Something went wrong')
        } catch (e) {
            error = new ResponseError('Something went wrong')
        }
        error.status = res.status
        throw error
    }

    return res
}

export async function publishEvents(
    logger: DVCLogger,
    envKey: string | null,
    eventsBatch: SDKEventBatchRequestBody,
    eventsBaseURLOverride?: string
): Promise<Response> {
    if (!envKey) {
        throw new Error('DevCycle is not yet initialized to publish events.')
    }
    const url = eventsBaseURLOverride ? `${eventsBaseURLOverride}${EVENTS_PATH}` : `${EVENT_URL}${HOST}${EVENTS_PATH}`
    return await post(url, {
        body: JSON.stringify({ batch: eventsBatch })
    }, envKey)
}

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string
): Promise<Response> {
    const headers: Record<string, string> = etag ? { 'If-None-Match': etag } : {}

    return await getWithTimeout(url, {
        headers: headers,
        retries: 1
    }, requestTimeout)
}

export async function getAllFeatures(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<Response> {
    const baseUrl = `${options.bucketingAPIURI || BUCKETING_URL}${FEATURES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        body: JSON.stringify(user),
        retries: 5
    }, envKey)
}

export async function getAllVariables(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<Response> {
    const baseUrl = `${options.bucketingAPIURI || BUCKETING_URL}${VARIABLES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        retries: 5
    }, envKey)
}

export async function getVariable(
    user: DVCPopulatedUser,
    envKey: string,
    variableKey: string,
    options: DVCOptions
): Promise<Response> {
    const baseUrl = `${options.bucketingAPIURI || BUCKETING_URL}${VARIABLES_PATH}/${variableKey}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        body: JSON.stringify(user),
        retries: 5
    }, envKey)
}

export async function postTrack(
    user: DVCPopulatedUser,
    event: DVCEvent,
    envKey: string,
    options: DVCOptions
): Promise<void> {
    const baseUrl = `${options.bucketingAPIURI || BUCKETING_URL}${TRACK_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    await post(postUrl, {
        body: JSON.stringify({
            user,
            events: [event]
        }),
        retries: 5
    }, envKey)
}

export async function post(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    envKey: string
): Promise<Response> {
    const [_fetch, config] = await getFetchAndConfig(requestConfig)
    const postHeaders = { ...config.headers, 'Authorization': envKey, 'Content-Type': 'application/json' }
    const res = await _fetch(url, {
        ...config,
        headers: postHeaders,
        method: 'POST'
    })

    return handleResponse(res)
}

export async function get(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry
): Promise<Response> {
    const [_fetch, config] = await getFetchAndConfig(requestConfig)
    const headers = { ...config.headers, 'Content-Type': 'application/json' }

    const res = await _fetch(url, {
        ...config,
        headers,
        method: 'GET'
    })

    return handleResponse(res)
}

async function getWithTimeout(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    timeout: number
): Promise<Response> {
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

async function getFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch
    }

    return (await import('cross-fetch')).default
}

async function getFetchWithRetry() {
    const fetch = await getFetch()
    return fetchWithRetry(fetch)
}

type FetchClient = Awaited<ReturnType<typeof getFetch>>
type FetchAndConfig = [FetchClient, RequestInit]

async function getFetchAndConfig(requestConfig: RequestInit | RequestInitWithRetry): Promise<FetchAndConfig> {
    const useRetries = 'retries' in requestConfig
    if (useRetries && requestConfig.retries) {
        const newConfig: RequestInitWithRetry = { ...requestConfig }
        newConfig.retryOn = retryOnRequestError(requestConfig.retries)
        newConfig.retryDelay = exponentialBackoff
        return [await getFetchWithRetry(), newConfig]
    }

    return [await getFetch(), requestConfig]
}
