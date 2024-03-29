// NOTE: This file is duplicated from "lib/shared/server-request" because nx:rollup cant build non-external dependencies
// from outside the root directory https://github.com/nrwl/nx/issues/10395
// EDIT: This file has diverged from the server-request lib by removing the dynamic import of cross-fetch

import fetchWithRetry, { RequestInitWithRetry } from 'fetch-retry'
export class ResponseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ResponseError'
    }

    status: number
}

export const exponentialBackoff: RequestInitWithRetry['retryDelay'] = (
    attempt,
) => {
    const delay = Math.pow(2, attempt) * 100
    const randomSum = delay * 0.2 * Math.random()
    return delay + randomSum
}

type retryOnRequestErrorFunc = (
    retries: number,
) => RequestInitWithRetry['retryOn']

const retryOnRequestError: retryOnRequestErrorFunc = (retries) => {
    return (attempt, error, response) => {
        if (attempt >= retries) {
            return false
        } else if (response && response?.status < 500) {
            return false
        }

        return true
    }
}

export async function handleResponse(res: Response): Promise<Response> {
    // res.ok only checks for 200-299 status codes
    if (!res.ok && res.status >= 400) {
        let error
        try {
            const response: any = await res.clone().json()
            error = new ResponseError(
                response.message || 'Something went wrong',
            )
        } catch (e) {
            error = new ResponseError('Something went wrong')
        }
        error.status = res.status
        throw error
    }

    return res
}

export async function getWithTimeout(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    timeout: number,
): Promise<Response> {
    const controller = new AbortController()
    try {
        const id = setTimeout(() => {
            controller.abort()
        }, timeout)
        const response = await get(url, {
            ...requestConfig,
            signal: controller.signal,
        })
        clearTimeout(id)
        return response
    } catch (e) {
        if (controller?.signal?.aborted) {
            throw new Error('Network connection timed out.')
        } else {
            throw e
        }
    }
}

export async function post(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    sdkKey: string,
): Promise<Response> {
    const [_fetch, config] = await getFetchAndConfig(requestConfig)
    const postHeaders = {
        ...config.headers,
        Authorization: sdkKey,
        'Content-Type': 'application/json',
    }

    const res = await _fetch(url, {
        ...config,
        headers: postHeaders,
        method: 'POST',
    })

    return handleResponse(res)
}

export async function patch(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
    sdkKey: string,
): Promise<Response> {
    const [_fetch, config] = await getFetchAndConfig(requestConfig)
    const patchHeaders = {
        ...config.headers,
        Authorization: sdkKey,
        'Content-Type': 'application/json',
    }

    const res = await _fetch(url, {
        ...config,
        headers: patchHeaders,
        method: 'PATCH',
    })

    return handleResponse(res)
}
export async function get(
    url: string,
    requestConfig: RequestInit | RequestInitWithRetry,
): Promise<Response> {
    const [_fetch, config] = await getFetchAndConfig(requestConfig)
    const headers = { ...config.headers, 'Content-Type': 'application/json' }

    const res = await _fetch(url, {
        ...config,
        headers,
        method: 'GET',
    })

    return handleResponse(res)
}

function getFetchWithRetry() {
    return fetchWithRetry(fetch)
}

type FetchClient = Awaited<typeof fetch>
type FetchAndConfig = [FetchClient, RequestInit]

async function getFetchAndConfig(
    requestConfig: RequestInit | RequestInitWithRetry,
): Promise<FetchAndConfig> {
    const useRetries = 'retries' in requestConfig
    if (useRetries && requestConfig.retries) {
        const newConfig: RequestInitWithRetry = { ...requestConfig }
        newConfig.retryOn = retryOnRequestError(requestConfig.retries)
        newConfig.retryDelay = exponentialBackoff
        return [getFetchWithRetry(), newConfig]
    }

    return [fetch, requestConfig]
}
