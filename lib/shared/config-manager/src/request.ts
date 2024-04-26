import { getWithTimeout } from '@devcycle/server-request'

export async function getEnvironmentConfig(
    url: string,
    requestTimeout: number,
    etag?: string,
    lastModified?: string,
): Promise<Response> {
    const headers: Record<string, string> = {}
    if (etag) {
        headers['If-None-Match'] = etag
    }
    if (lastModified) {
        headers['If-Modified-Since'] = lastModified
    }

    return await getWithTimeout(
        url,
        {
            headers: headers,
            retries: 1,
        },
        requestTimeout,
    )
}
