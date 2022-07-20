jest.mock('../src/request')
jest.useFakeTimers()
jest.spyOn(global, 'setInterval')
jest.mock('../src/bucketing')

import { EnvironmentConfigManager } from '../src/environmentConfigManager'
import { getEnvironmentConfig } from '../src/request'
import { importBucketingLib, getBucketingLib } from '../src/bucketing'
import { mocked } from 'ts-jest/utils'
import { AxiosResponse } from 'axios'
import { dvcDefaultLogger } from '../src/utils/logger'
import { EventEmitter, EventNames } from '../src/eventEmitter'

const setInterval_mock = mocked(setInterval, true)
const getEnvironmentConfig_mock = mocked(getEnvironmentConfig, true)
const logger = dvcDefaultLogger()
const eventEmitter = new EventEmitter()

describe('EnvironmentConfigManager Unit Tests', () => {
    beforeAll(async () => {
        await importBucketingLib()
    })
    beforeEach(() => {
        getEnvironmentConfig_mock.mockReset()
        setInterval_mock.mockReset()
        eventEmitter.events = {}
    })

    function mockAxiosResponse(obj: any): AxiosResponse {
        return {
            status: 200,
            statusText: '',
            data: {},
            headers: {},
            config: {},
            ...obj
        }
    }

    it('should build manager from constructor', async () => {
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000,
        }, eventEmitter)
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
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 10,
            configPollingTimeoutMS: 10000
        }, eventEmitter)
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
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 200 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        }, eventEmitter)
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 304 }))
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
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 500 }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {}, eventEmitter)
        expect(envConfig.fetchConfigPromise).rejects.toThrow('Failed to download DevCycle config.')
    })

    it('should throw error fetching config throws', () => {
        getEnvironmentConfig_mock.mockRejectedValue(new Error('Error'))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {}, eventEmitter)
        expect(envConfig.fetchConfigPromise).rejects.toThrow('Failed to download DevCycle config.')
    })

    it('should use cached config if fetching config fails', async () => {
        const config = { config: {} }
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 200, data: config }))

        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        }, eventEmitter)
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        await envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 500 }))
        await envConfig._fetchConfig()

        envConfig.cleanup()
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
    })

    it('should emit event when config is fetched', async () => {
        const updatedCallback = jest.fn()
        eventEmitter.subscribe(EventNames.CONFIG_UPDATED, updatedCallback)

        const config = { config: {} }
        getEnvironmentConfig_mock.mockResolvedValue(mockAxiosResponse({ status: 200, data: config }))
        
        const envConfig = new EnvironmentConfigManager(logger, 'envKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000
        }, eventEmitter)
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        await envConfig.fetchConfigPromise        
        expect(updatedCallback).toBeCalledTimes(1)

        // subsequent config calls that return a 304 won't emit an event
        getEnvironmentConfig_mock.mockResolvedValueOnce(mockAxiosResponse({ status: 304 }))
        await envConfig._fetchConfig()
        expect(updatedCallback).toBeCalledTimes(1)

        // any 200s will trigger the event
        await envConfig._fetchConfig()
        expect(updatedCallback).toBeCalledTimes(2)
    })
})
