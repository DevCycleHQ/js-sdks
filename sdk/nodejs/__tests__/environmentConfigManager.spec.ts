jest.mock('../src/request')
jest.useFakeTimers()
jest.spyOn(global, 'setInterval')
jest.mock('../src/bucketing')

import { Response } from 'node-fetch-cjs'
import { EnvironmentConfigManager } from '../src/environmentConfigManager'
import { getEnvironmentConfig } from '../src/request'
import { importBucketingLib, getBucketingLib } from '../src/bucketing'
import { mocked } from 'jest-mock'
import { dvcDefaultLogger } from '../src/utils/logger'

const setInterval_mock = mocked(setInterval, true)
const getEnvironmentConfig_mock = mocked(getEnvironmentConfig, true)
const logger = dvcDefaultLogger()

describe('EnvironmentConfigManager Unit Tests', () => {
    beforeAll(async () => {
        await importBucketingLib()
    })
    beforeEach(() => {
        getEnvironmentConfig_mock.mockReset()
        setInterval_mock.mockReset()
    })

    function mockFetchResponse(obj: any): Response {
        return new Response('{}', {
            status: 200,
            statusText: '',
            headers: {},
            config: {},
            ...obj
        })
    }

    it('should build manager from constructor', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        })
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        await envConfig._fetchConfig()
        expect(getBucketingLib().setConfigData).toHaveBeenCalledWith('envKey', '{}')

        expect(envConfig).toEqual(expect.objectContaining({
            environmentKey: 'envKey',
            fetchConfigPromise: expect.any(Promise),
            pollingIntervalMS: 1000,
            requestTimeoutMS: 1000
        }))
        envConfig.cleanup()
    })

    it('should override the configPollingIntervalMS and configPollingTimeoutMS settings', () => {
        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 10,
            configPollingTimeoutMS: 10000
        })
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        envConfig._fetchConfig()

        expect(envConfig).toEqual(expect.objectContaining({
            environmentKey: 'envKey',
            fetchConfigPromise: expect.any(Promise),
            pollingIntervalMS: 1000,
            requestTimeoutMS: 1000
        }))
        envConfig.cleanup()
    })

    it('should call fetch config on the interval period time', (done) => {
        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        })
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 304 }))

        envConfig._fetchConfig()

        envConfig.cleanup()
        expect(envConfig).toEqual(expect.objectContaining({
            environmentKey: 'envKey',
            fetchConfigPromise: expect.any(Promise),
            pollingIntervalMS: 1000,
            requestTimeoutMS: 1000
        }))
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
        done()
    })

    it('should throw error fetching config fails with 500 error', () => {
        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 500 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {})
        expect(envConfig.fetchConfigPromise).rejects.toThrow('Failed to download DevCycle config.')
    })

    it('should throw error fetching config throws', () => {
        getEnvironmentConfig_mock.mockRejectedValue(new Error('Error'))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {})
        expect(envConfig.fetchConfigPromise).rejects.toThrow('Failed to download DevCycle config.')
    })

    it('should use cached config if fetching config fails', async () => {
        const config = { config: {} }
        getEnvironmentConfig_mock.mockImplementation(async () => mockFetchResponse({ status: 200, data: config }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        })
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        await envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockResolvedValue(mockFetchResponse({ status: 500 }))
        await envConfig._fetchConfig()

        envConfig.cleanup()
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
    })
})
