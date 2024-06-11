import { getWithTimeout } from '@devcycle/server-request'
import { RequestInitWithRetry } from 'fetch-retry'
import { DVCLogger } from '@devcycle/types'

export const isValidDate = (date: Date | null): date is Date =>
    date instanceof Date && !isNaN(date.getTime())

export async function getEnvironmentConfig({
    logger,
    url,
    requestTimeout,
    currentEtag,
    currentLastModified,
    sseLastModified,
}: {
    logger: DVCLogger
    url: string
    requestTimeout: number
    currentEtag?: string
    currentLastModified?: string
    sseLastModified?: string
}): Promise<Response> {
    const headers: Record<string, string> = {}
    let retries = 1

    let retryOn: RequestInitWithRetry['retryOn'] | undefined
    const sseLastModifiedDate = sseLastModified
        ? new Date(sseLastModified)
        : null

    // Retry fetching config if the Last-Modified header is older than
    // the requiredLastModified from the SSE message
    if (sseLastModified && isValidDate(sseLastModifiedDate)) {
        retries = 3
        retryOn = (attempt, error, response) => {
            if (attempt >= retries) {
                return false
            } else if (response && response?.status === 200) {
                const lastModifiedHeader = response.headers.get('Last-Modified')
                const lastModifiedHeaderDate = lastModifiedHeader
                    ? new Date(lastModifiedHeader)
                    : null

                if (
                    isValidDate(lastModifiedHeaderDate) &&
                    lastModifiedHeaderDate < sseLastModifiedDate
                ) {
                    logger.debug(
                        `Retry fetching config, last modified is old: ${lastModifiedHeader}` +
                            `, sse last modified: ${sseLastModified}`,
                    )
                    return true
                }
                return false
            } else if (response && response?.status < 500) {
                return false
            }

            return true
        }
    }
    if (currentEtag) {
        headers['If-None-Match'] = currentEtag
    }
    if (currentLastModified) {
        headers['If-Modified-Since'] = currentLastModified
    }

    return await getWithTimeout(
        url,
        {
            headers: headers,
            retries,
            retryOn,
        },
        requestTimeout,
    )
}
