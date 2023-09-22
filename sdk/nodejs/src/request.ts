import { RequestInitWithRetry } from 'fetch-retry'
import { get, post } from '@devcycle/js-cloud-server-sdk'
import { DVCLogger, SDKEventBatchRequestBody } from '@devcycle/types'

export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string,
): Promise<Response> {
    const headers: Record<string, string> = etag
        ? { 'If-None-Match': etag }
        : {}

    return await getWithTimeout(
        url,
        {
            headers: headers,
            retries: 1,
        },
        requestTimeout,
    )
}

export async function publishEvents(
    logger: DVCLogger,
    sdkKey: string | null,
    eventsBatch: SDKEventBatchRequestBody,
    eventsBaseURLOverride?: string,
): Promise<Response> {
    if (!sdkKey) {
        throw new Error('DevCycle is not yet initialized to publish events.')
    }
    const url = eventsBaseURLOverride
        ? `${eventsBaseURLOverride}${EVENTS_PATH}`
        : `${EVENT_URL}${HOST}${EVENTS_PATH}`
    return await post(
        url,
        {
            body: JSON.stringify({ batch: eventsBatch }),
        },
        sdkKey,
    )
}

async function getWithTimeout(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    timeout: number,
): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => {
        controller.abort()
    }, timeout)
    const response = await get(url, {
        ...requestConfig,
        signal: controller.signal,
    })
    clearTimeout(id)
    return response
}
