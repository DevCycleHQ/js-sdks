jest.mock('../src/request')
jest.useFakeTimers()
jest.spyOn(global, 'setInterval')

const mockEventSourceMethods = {
    onmessage: jest.fn(),
    onerror: jest.fn(),
    onopen: jest.fn(),
    close: jest.fn(),
}
const MockEventSource = jest
    .fn()
    .mockImplementation(() => mockEventSourceMethods)
jest.mock('eventsource', () => MockEventSource)

import { EnvironmentConfigManager } from '../src'
import { mocked } from 'jest-mock'
import { Response } from 'cross-fetch'
import { DVCLogger, DevCycleServerSDKOptions } from '@devcycle/types'
import { getEnvironmentConfig } from '../src/request'
import { ResponseError } from '@devcycle/server-request'

const setInterval_mock = mocked(setInterval)
const getEnvironmentConfig_mock = mocked(getEnvironmentConfig)
const trackSDKConfigEvent_mock = jest.fn()
const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
}

const mockSDKConfig = jest.fn()

function getConfigManager(
    logger: DVCLogger,
    sdkKey: string,
    options: DevCycleServerSDKOptions,
) {
    return new EnvironmentConfigManager(
        logger,
        sdkKey,
        mockSDKConfig,
        setInterval,
        clearInterval,
        trackSDKConfigEvent_mock,
        options,
    )
}

describe('EnvironmentConfigManager Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    function mockFetchResponse(
        obj: any,
        bodyStr?: string,
        headers?: HeadersInit,
    ): Response {
        if (obj.status >= 400) {
            const error = new ResponseError('')
            error.status = obj.status
            throw error
        }
        return new Response(bodyStr ?? '{}', {
            status: 200,
            statusText: '',
            headers: headers ?? {},
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
                currentPollingInterval: 1000,
                configPollingIntervalMS: 1000,
                sseConfigPollingIntervalMS: 10 * 60 * 1000,
                requestTimeoutMS: 1000,
            }),
        )
        envConfig.cleanup()
    })

    it(
        'should override the configPollingIntervalMS, configPollingTimeoutMS, ' +
            'and sseConfigPollingIntervalMS settings',
        async () => {
            getEnvironmentConfig_mock.mockImplementation(async () =>
                mockFetchResponse({ status: 200 }),
            )

            const envConfig = getConfigManager(logger, 'sdkKey', {
                configPollingIntervalMS: 10,
                configPollingTimeoutMS: 10000,
                sseConfigPollingIntervalMS: 2 * 60 * 1000,
            })
            await envConfig.fetchConfigPromise
            expect(setInterval_mock).toHaveBeenCalledTimes(1)

            await envConfig._fetchConfig()

            expect(envConfig).toEqual(
                expect.objectContaining({
                    sdkKey: 'sdkKey',
                    fetchConfigPromise: expect.any(Promise),
                    currentPollingInterval: 1000,
                    configPollingIntervalMS: 1000,
                    sseConfigPollingIntervalMS: 2 * 60 * 1000,
                    requestTimeoutMS: 1000,
                }),
            )
            envConfig.cleanup()
        },
    )

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
                currentPollingInterval: 1000,
                configPollingIntervalMS: 1000,
                sseConfigPollingIntervalMS: 10 * 60 * 1000,
                requestTimeoutMS: 1000,
            }),
        )
        expect(trackSDKConfigEvent_mock).toBeCalledWith(
            'https://config-cdn.devcycle.com/config/v1/server/sdkKey.json',
            expect.any(Number),
            expect.objectContaining({ status: 200 }),
            undefined,
            undefined,
            undefined,
        )
        expect(getEnvironmentConfig_mock).toBeCalledTimes(3)
    })

    it('should throw error fetching config fails with 500 error', async () => {
        getEnvironmentConfig_mock.mockImplementation(async () =>
            mockFetchResponse({ status: 500 }),
        )

        const envConfig = getConfigManager(logger, 'sdkKey', {})
        await expect(envConfig.fetchConfigPromise).rejects.toThrow(
            'Failed to download DevCycle config.',
        )
        expect(trackSDKConfigEvent_mock).toBeCalledWith(
            'https://config-cdn.devcycle.com/config/v1/server/sdkKey.json',
            expect.any(Number),
            undefined,
            expect.objectContaining({
                status: 500,
            }),
            undefined,
            undefined,
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

    describe('SSE Connection', () => {
        const lastModifiedDate = new Date()
        const connectToSSE = async (config?: string) => {
            getEnvironmentConfig_mock.mockImplementation(async () =>
                mockFetchResponse(
                    {
                        status: 200,
                        headers: {
                            etag: 'etag-1',
                            'last-modified': lastModifiedDate.toISOString(),
                        },
                    },
                    config ??
                        JSON.stringify({
                            sse: {
                                path: 'sse-path',
                                hostname: 'https://sse.devcycle.com',
                            },
                        }),
                ),
            )

            const envConfig = getConfigManager(logger, 'sdkKey', {
                configPollingIntervalMS: 1000,
                configPollingTimeoutMS: 1000,
                enableBetaRealTimeUpdates: true,
            })
            await envConfig.fetchConfigPromise
            return envConfig
        }

        it('should call fetch config if SSE connection is established after 10 min', async () => {
            const envConfig = await connectToSSE()
            mockEventSourceMethods.onopen()

            expect(setInterval_mock).toHaveBeenCalledTimes(2)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)
            expect(MockEventSource).toBeCalledTimes(1)

            jest.advanceTimersByTime(10 * 60 * 1000)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(2)

            envConfig.cleanup()
        })

        it('should not connect to SSE if no config.see', async () => {
            const envConfig = await connectToSSE('{}')

            expect(setInterval_mock).toHaveBeenCalledTimes(1)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)
            expect(MockEventSource).not.toHaveBeenCalled()

            envConfig.cleanup()
        })

        it('should continue polling and stop SSE if connection fails', async () => {
            const envConfig = await connectToSSE()
            mockEventSourceMethods.onerror({ status: 401 })

            expect(setInterval_mock).toHaveBeenCalledTimes(1)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)
            expect(mockEventSourceMethods.close).toBeCalledTimes(1)

            jest.advanceTimersByTime(1000)
            expect(setInterval_mock).toHaveBeenCalledTimes(1)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(2)

            envConfig.cleanup()
        })

        it('should process SSE messages and fetch new config', async () => {
            const envConfig = await connectToSSE()
            mockEventSourceMethods.onopen()
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)

            mockEventSourceMethods.onmessage({
                data: JSON.stringify({
                    data: JSON.stringify({
                        type: 'refetchConfig',
                        etag: 'etag-2',
                        lastModified: new Date().toISOString(),
                    }),
                }),
            })
            jest.advanceTimersByTime(1000)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(2)

            envConfig.cleanup()
        })

        it('should skip SSE message if older last modified date is received', async () => {
            const envConfig = await connectToSSE()
            mockEventSourceMethods.onopen()
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)

            const oldLastModifiedDate = new Date(
                lastModifiedDate.getTime() - 1000,
            )
            mockEventSourceMethods.onmessage({
                data: JSON.stringify({
                    data: JSON.stringify({
                        type: 'refetchConfig',
                        etag: 'etag-2',
                        lastModified: oldLastModifiedDate.toISOString(),
                    }),
                }),
            })
            jest.advanceTimersByTime(1000)
            expect(getEnvironmentConfig_mock).toBeCalledTimes(1)

            envConfig.cleanup()
        })

        it('should skip fetching config if older last modified date is received', async () => {})

        it('should handle SSE connection failures after initial connection and reconnect', async () => {})

        it('should re-connect SSE if path changes', async () => {})
    })
})
