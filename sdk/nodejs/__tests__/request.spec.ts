jest.mock('node-fetch-cjs')
import fetch, { Response } from 'node-fetch-cjs'

const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>

import { dvcDefaultLogger } from '../src/utils/logger'
const logger = dvcDefaultLogger()
import { publishEvents, getEnvironmentConfig, post, get } from '../src/request'

describe('request.ts Unit Tests', () => {
    beforeEach(() => {
        fetchRequestMock.mockReset()
    })

    describe('publishEvents', () => {
        it('should throw errors for missing envKey / config', async () => {
            await expect(() => publishEvents(logger, null, []))
                .rejects.toThrow('DevCycle is not yet initialized to publish events.')
        })
    })

    describe('getEnvironmentConfig', () => {
        it('should get environment config', async () => {
            const url = 'https://test.devcycle.com/config'
            const etag = 'etag_value'
            fetchRequestMock.mockResolvedValue(new Response('', { status: 200 }) as any)

            const res = await getEnvironmentConfig(url, 60000, etag)
            expect(res.status).toEqual(200)
            expect(fetchRequestMock).toBeCalledWith(url, {
                'headers': {
                    'If-None-Match': etag,
                },
                'method': 'GET',
                'signal': expect.any(AbortSignal),
            })
        })
    })

    describe('get', () => {
        it('should make GET request', async () => {
            await get('https://test.com')
            expect(fetchRequestMock).toBeCalledWith('https://test.com', expect.objectContaining({
                method: 'GET',
            }))
        })
    })

    describe('post', () => {
        it('should make POST request', async () => {
            await post('https://test.com', {}, 'token')
            expect(fetchRequestMock).toBeCalledWith('https://test.com', expect.objectContaining({
                method: 'POST',
                headers: { 'Authorization': 'token' }
            }))
        })
    })
})
