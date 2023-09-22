jest.mock('cross-fetch')
import fetch, { Response } from 'cross-fetch'

global.fetch = fetch

const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>

import { publishEvents, getEnvironmentConfig } from '../src/request'
import { dvcDefaultLogger } from '@devcycle/js-cloud-server-sdk'
const logger = dvcDefaultLogger()

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
})
