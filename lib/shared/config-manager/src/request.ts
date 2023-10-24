import { RequestInitWithRetry } from 'fetch-retry'
import { get } from '@devcycle/js-cloud-server-sdk'

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
