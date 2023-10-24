import { getWithTimeout } from '@devcycle/server-request'

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
