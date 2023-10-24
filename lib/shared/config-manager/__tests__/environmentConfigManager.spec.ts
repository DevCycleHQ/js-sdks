jest.mock('../src/request')
jest.useFakeTimers()
jest.spyOn(global, 'setInterval')

import { EnvironmentConfigManager } from '../src'
import { mocked } from 'jest-mock'
import { Response } from 'cross-fetch'
import {
    DevCycleOptions,
    dvcDefaultLogger,
    ResponseError,
} from '@devcycle/js-cloud-server-sdk'
import { DVCLogger } from '@devcycle/types'
import { getEnvironmentConfig } from '../src/request'

const setInterval_mock = mocked(setInterval)
const getEnvironmentConfig_mock = mocked(getEnvironmentConfig)
const logger = dvcDefaultLogger()

const mockSDKConfig = jest.fn()

function getConfigManager(
    logger: DVCLogger,
    sdkKey: string,
    options: DevCycleOptions,
) {
    return new EnvironmentConfigManager(
        logger,
        sdkKey,
        mockSDKConfig,
        setInterval,
        clearInterval,
        options,
    )
}

describe('EnvironmentConfigManager Unit Tests', () => {
    beforeEach(() => {
        getEnvironmentConfig_mock.mockReset()
        setInterval_mock.mockReset()
    })

    function mockFetchResponse(obj: any): Response {
        if (obj.status >= 400) {
            const error = new ResponseError('')
            error.status = obj.status
            throw error
        }
        return new Response('{}', {
            status: 200,
            statusText: '',
            headers: {},
            config: {},
            ...obj,
        })
    }

    it('should build manager from constructor', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 200 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000,
        })
        await envConfig.fetchConfigPromise
        expect(setInterval_mock).toHaveBeenCalledTimes(1)

        await envConfig._fetchConfig()
        expect(mockSDKConfig).toHaveBeenCalledWith('sdkKey', '{}')

        expect(envConfig).toEqual(
            expect.objectContaining({
                sdkKey: 'sdkKey',
                fetchConfigPromise: expect.any(Promise),
                pollingIntervalMS: 1000,
                requestTimeoutMS: 1000,
            }),
        )
        envConfig.cleanup()
    })

    it('should override the configPollingIntervalMS and configPollingTimeoutMS settings', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 200 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {
            configPollingIntervalMS: 10,
            configPollingTimeoutMS: 10000,
        })
        await envConfig.fetchConfigPromise
        expect(setInterval_mock).toHaveBeenCalledTimes(1)

        await envConfig._fetchConfig()

        expect(envConfig).toEqual(
            expect.objectContaining({
                sdkKey: 'sdkKey',
                fetchConfigPromise: expect.any(Promise),
                pollingIntervalMS: 1000,
                requestTimeoutMS: 1000,
            }),
        )
        envConfig.cleanup()
    })

    it('should call fetch config on the interval period time', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 200 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000,
        })
        await envConfig.fetchConfigPromise
        expect(setInterval_mock).toHaveBeenCalledTimes(1)

        await envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 304, ok: false, data: null }),
        )

        await envConfig._fetchConfig()

        envConfig.cleanup()
        expect(envConfig).toEqual(
            expect.objectContaining({
                sdkKey: 'sdkKey',
                fetchConfigPromise: expect.any(Promise),
                pollingIntervalMS: 1000,
                requestTimeoutMS: 1000,
            }),
        )
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
    })

    it('should throw error fetching config fails with 500 error', () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 500 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {})
        expect(envConfig.fetchConfigPromise).rejects.toThrow(
            'Failed to download DevCycle config.',
        )
    })

    it('should throw invalid sdk key fetching config fails with 403 error', () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 403 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {})
        expect(envConfig.fetchConfigPromise).rejects.toThrow(
            'Invalid SDK key provided:',
        )
        expect(setInterval_mock).toHaveBeenCalledTimes(0)
    })

    it('should throw error fetching config throws', () => {
        getEnvironmentConfig_mock.mockRejectedValue(new Error('Error'))

        const envConfig = getConfigManager(logger, 'sdkKey', {})
        expect(envConfig.fetchConfigPromise).rejects.toThrow(
            'Failed to download DevCycle config.',
        )
    })

    it('should use cached config if fetching config fails', async () => {
        const config = { config: {} }
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 200, data: config }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {
            configPollingIntervalMS: 1000,
            configPollingTimeoutMS: 1000,
        })
        await envConfig.fetchConfigPromise
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
        await envConfig._fetchConfig()

        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 500 }),
        )
        await envConfig._fetchConfig()

        envConfig.cleanup()
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
    })

    it('should start interval if initial config fails', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 500 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {})
        await expect(envConfig.fetchConfigPromise).rejects.toThrow()
        expect(setInterval_mock).toHaveBeenCalledTimes(1)
    })
})
