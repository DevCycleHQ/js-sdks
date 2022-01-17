jest.mock('axios')
import axios from 'axios'
import { mocked } from 'ts-jest/utils'

const axiosRequestMock = jest.fn()
const createMock = mocked(axios.create, true)
// @ts-ignore
createMock.mockImplementation(() => ({ request: axiosRequestMock }))

import { defaultLogger } from '../src'
const logger = defaultLogger()
import { publishEvents, getEnvironmentConfig, post, get } from '../src/request'

describe('request.ts Unit Tests', () => {
    beforeEach(() => {
        axiosRequestMock.mockReset()
    })

    describe('publishEvents', () => {
        it('should throw errors for missing envKey / config', async () => {
            await expect(() => publishEvents(logger, null, []))
                .rejects.toThrow('DevCycle is not yet initialized to publish events.')
        })
    })

    describe('getEnvironmentConfig', () => {
        it('should get environment config', async () => {
            const config = {}
            const url = 'https://test.devcycle.com/config'
            const etag = 'etag_value'
            axiosRequestMock.mockResolvedValue({ status: 200, config })

            const res = await getEnvironmentConfig(url, 60000, etag)
            expect(res.status).toEqual(200)
            expect(axiosRequestMock).toBeCalledWith({
                'headers': {
                    'If-None-Match': etag,
                },
                'method': 'GET',
                'timeout': 60000,
                'url': url,
            })
        })
    })

    describe('get', () => {
        it('should make GET request', async () => {
            await get({ url: 'https://test.com' })
            expect(axiosRequestMock).toBeCalledWith(expect.objectContaining({
                method: 'GET',
                url: 'https://test.com'
            }))
        })
    })

    describe('post', () => {
        it('should make POST request', async () => {
            await post({ url: 'https://test.com' })
            expect(axiosRequestMock).toBeCalledWith(expect.objectContaining({
                method: 'POST',
                url: 'https://test.com'
            }))
        })
    })
})
