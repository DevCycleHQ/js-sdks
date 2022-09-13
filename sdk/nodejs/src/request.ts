import { SDKEventBatchRequestBody, DVCLogger, ConfigBody } from '@devcycle/types'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCEvent, DVCFeatureSet, DVCOptions, DVCVariable as DVCVariableInterface, DVCVariableSet, JSONResponse } from './types'

import nodeFetch from 'node-fetch'

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
): Promise<JSONResponse<any>> {
    if (!envKey) {
        throw new Error('DevCycle is not yet initialized to publish events.')
    }

    const eventsUrl =`${EVENT_URL}${HOST}${EVENTS_PATH}`
    const res = await post(eventsUrl, {
        body: JSON.stringify({ batch: eventsBatch })
    }, envKey)
    if (res.status !== 201) {
        logger.error(`Error posting events, status: ${res.status}, body: ${res?.body}`)
    } else {
        logger.debug(`Posted Events, status: ${res.status}, body: ${res?.body}`)
    }

    return res
}

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string
): Promise<JSONResponse<ConfigBody>> {
    const headers: Headers = new Headers()
    if (etag) {
        headers.append('If-None-Match', etag)
    }

    return await getWithTimeout(url, {
        timeout: requestTimeout,
        headers: headers
    })
}

export async function getAllFeatures(
    user: DVCPopulatedUser,
    envKey: string,
    options: DVCOptions
): Promise<JSONResponse<DVCFeatureSet>> {
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
): Promise<JSONResponse<DVCVariableSet>> {
    const baseUrl = `${options.apiProxyURL || BUCKETING_URL}${VARIABLES_PATH}`
    const postUrl = baseUrl.concat(options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '')
    return await post(postUrl, {
        body: JSON.stringify(user)
    }, envKey)
}

export async function getVariable(
    user: DVCPopulatedUser,
    envKey: string,
    variableKey: string,
    options: DVCOptions
): Promise<JSONResponse<DVCVariableInterface>> {
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

export const post = async function <T>(url: string, requestOptions: any, envKey: string): Promise<JSONResponse<T>> {
    const _fetch = getFetch()
    const postHeaders: Headers = new Headers({ 'Authorization': envKey })

    if (requestOptions.headers) {
        Object.keys(requestOptions.headers).forEach(key => {
            postHeaders.append(key, requestOptions.headers[key])
        })
    }

    const response = await _fetch(url, {
        ...requestOptions,
        headers: postHeaders,
        method: 'POST'
    })

    const jsonResponse = {
        ...response,
        body: await response.json() as T
    }

    return jsonResponse as unknown as JSONResponse<T>
}


export const get = async function <T>(url: string, requestOptions: any): Promise<JSONResponse<T>> {
    const _fetch = getFetch()

    const response = await _fetch(url, {
        ...requestOptions,
        method: 'GET'
    })

    const jsonResponse = {
        ...response,
        body: await response.json() as T
    }

    return jsonResponse as unknown as JSONResponse<T>
}

function getFetch() {
    if (typeof global.fetch !== 'undefined') {
        return fetch
    }
    return nodeFetch
}

const getWithTimeout = async function <T>(url: string, options: any): Promise<JSONResponse<T>> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), options.timeout)
    const response = await get(url, {
        ...options,
        signal: controller.signal
    })
    clearTimeout(id)
    return response as unknown as JSONResponse<T>
}
