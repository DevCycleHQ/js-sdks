jest.mock('cross-fetch')
import fetch, { Response } from 'cross-fetch'

global.fetch = fetch

const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>

import { dvcDefaultLogger } from '../src/utils/logger'
const logger = dvcDefaultLogger()
import { publishEvents, getEnvironmentConfig, post, get } from '../src/request'

describe('request.ts Unit Tests', () => {
    beforeEach(() => {
        fetchRequestMock.mockReset()
    })

    describe('publishEvents', () => {
        it('should throw errors for missing sdkKey / config', async () => {
            await expect(() => publishEvents(logger, null, [])).rejects.toThrow(
                'DevCycle is not yet initialized to publish events.',
            )
        })
    })

    describe('getEnvironmentConfig', () => {
        it('should get environment config', async () => {
            const url = 'https://test.devcycle.com/config'
            const etag = 'etag_value'
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }) as any,
            )

            const res = await getEnvironmentConfig(url, 60000, etag)
            expect(res.status).toEqual(200)
            expect(fetchRequestMock).toBeCalledWith(url, {
                headers: {
                    'If-None-Match': etag,
                    'Content-Type': 'application/json',
                },
                retries: 1,
                retryDelay: expect.any(Function),
                retryOn: expect.any(Function),
                method: 'GET',
                signal: expect.any(AbortSignal),
            })
        })
    })

    describe('get', () => {
        it('should make GET request', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }),
            )
            await get('https://test.com', {})
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })

        it('should fail on GET request for 500 error', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 500 }),
            )
            await expect(get('https://test.com', {})).rejects.toThrow()
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })
    })

    describe('post', () => {
        it('should make POST request', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }),
            )
            await post('https://test.com', {}, 'token')
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        Authorization: 'token',
                        'Content-Type': 'application/json',
                    },
                }),
            )
        })

        it('should fail on POST request for 500 error', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 500 }),
            )
            await expect(
                post('https://test.com', {}, 'token'),
            ).rejects.toThrow()
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        Authorization: 'token',
                        'Content-Type': 'application/json',
                    },
                }),
            )
        })
    })
})
