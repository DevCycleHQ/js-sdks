jest.mock('cross-fetch')
import fetch, { Response } from 'cross-fetch'

global.fetch = fetch

import { getEnvironmentConfig } from '../src/request'
const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>

const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
}

describe('request.ts Unit Tests', () => {
    beforeEach(() => {
        fetchRequestMock.mockReset()
    })

    describe('getEnvironmentConfig', () => {
        it('should get environment config', async () => {
            const url = 'https://test.devcycle.com/config'
            const etag = 'etag_value'
            const lastModified = 'last_modified_value'
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }) as any,
            )

            const res = await getEnvironmentConfig({
                logger,
                url,
                requestTimeout: 60000,
                currentEtag: etag,
                currentLastModified: lastModified,
            })
            expect(res.status).toEqual(200)
            expect(fetchRequestMock).toBeCalledWith(url, {
                headers: {
                    'If-None-Match': etag,
                    'If-Modified-Since': lastModified,
                    'Content-Type': 'application/json',
                },
                retries: 1,
                retryDelay: expect.any(Function),
                retryOn: expect.any(Function),
                method: 'GET',
                signal: expect.any(AbortSignal),
            })
        })

        it('should retry requests where last-modified date of CDN is less than SSE date', async () => {
            const url = 'https://test.devcycle.com/config'
            const etag = 'etag_value'
            const lastModifiedDate = new Date()
            const sseLastModifiedDate = new Date(
                lastModifiedDate.getTime() + 1000,
            )
            fetchRequestMock.mockResolvedValue(
                new Response('{}', {
                    status: 200,
                    headers: {
                        'Last-Modified': lastModifiedDate.toISOString(),
                    },
                }) as any,
            )

            const res = await getEnvironmentConfig({
                logger,
                url,
                requestTimeout: 60000,
                currentEtag: etag,
                currentLastModified: lastModifiedDate.toISOString(),
                sseLastModified: sseLastModifiedDate.toISOString(),
            })
            expect(res.status).toEqual(200)
            expect(fetchRequestMock).toHaveBeenCalledTimes(4)
        })
    })
})
