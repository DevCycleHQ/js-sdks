import { Exports } from '@devcycle/bucketing-assembly-script'

jest.mock('../src/request')
import { EventQueue, EventQueueOptions } from '../src/eventQueue'
import { EventTypes } from '../src/eventQueue'
import { BucketedUserConfig, DVCReporter, PublicProject } from '@devcycle/types'
import { mocked } from 'jest-mock'
import { importBucketingLib } from '../src/bucketing'
import { setPlatformDataJSON } from './utils/setPlatformData'
import { Response } from 'cross-fetch'
import { dvcDefaultLogger } from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from '../src/models/populatedUserHelpers'
import { publishEvents } from '../src/request'

import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import { ResponseError } from '@devcycle/server-request'
const { config } = testData

const publishEvents_mock = mocked(publishEvents)
const defaultLogger = dvcDefaultLogger()

describe('EventQueue Unit Tests', () => {
    let bucketing: Exports
    const bucketedUserConfig: BucketedUserConfig = {
        environment: { _id: '', key: '' },
        features: {},
        project: {
            _id: '',
            key: '',
            a0_organization: 'org_',
            settings: { edgeDB: { enabled: false } },
        } as PublicProject,
        variables: {},
        featureVariationMap: { feature: 'var' },
        variableVariationMap: {
            key: {
                _feature: 'feature',
                _variation: 'variation',
            },
            key_1: {
                _feature: 'feature_1',
                _variation: 'variation_1',
            },
            key_2: {
                _feature: 'feature_2',
                _variation: 'variation_2',
            },
            key_3: {
                _feature: 'feature_3',
                _variation: 'variation_3',
            },
            key_4: {
                _feature: 'feature_4',
                _variation: 'variation_4',
            },
        },
    }
    const mockFetchResponse = (obj: any): Response =>
        new Response('{}', {
            status: 200,
            statusText: '',
            headers: {},
            config: {},
            ...obj,
        })

    let currentEventKey = ''
    const initEventQueue = (
        sdkKey: string,
        clientUUID: string,
        optionsOverrides?: Partial<EventQueueOptions>,
    ): EventQueue => {
        bucketing.setConfigData(sdkKey, JSON.stringify(config))
        currentEventKey = sdkKey
        const options = {
            logger: defaultLogger,
            ...optionsOverrides,
        }
        return new EventQueue(sdkKey, clientUUID, bucketing, options)
    }

    beforeAll(async () => {
        ;[bucketing] = await importBucketingLib()
        setPlatformDataJSON(bucketing)
    })

    afterEach(() => {
        publishEvents_mock.mockReset()
        bucketing.cleanupEventQueue(currentEventKey)
    })

    it('should report metrics', async () => {
        publishEvents_mock.mockResolvedValue(mockFetchResponse({ status: 201 }))

        const reporter: DVCReporter = {
            reportFlushResults: jest.fn(),
            reportMetric: jest.fn(),
        }

        const sdkKey = 'sdkKey'
        const eventQueue = initEventQueue(sdkKey, 'uuid', { reporter })
        const user = DVCPopulatedUserFromDevCycleUser({ user_id: 'user_id' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event)

        const aggEvent = {
            type: EventTypes.aggVariableEvaluated,
            target: 'key',
        }
        eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        await new Promise((resolve) => setTimeout(resolve, 1000))

        expect(reporter.reportFlushResults).toBeCalled()
        expect(reporter.reportMetric).toBeCalledWith(
            'queueLength',
            2,
            expect.objectContaining({ sdkKey }),
        )
        expect(reporter.reportMetric).toBeCalledWith(
            'flushPayloadSize',
            expect.any(Number),
            expect.objectContaining({ sdkKey }),
        )
        expect(reporter.reportMetric).toBeCalledWith(
            'jsonParseDuration',
            expect.any(Number),
            expect.objectContaining({ sdkKey }),
        )
        expect(reporter.reportMetric).toBeCalledWith(
            'flushRequestDuration',
            expect.any(Number),
            expect.objectContaining({ sdkKey }),
        )
    })

    it('should setup Event Queue and process events', async () => {
        publishEvents_mock.mockResolvedValue(mockFetchResponse({ status: 201 }))

        const eventQueue = initEventQueue('sdkKey', 'uuid', {
            eventsAPIURI: 'localhost:3000/client/1',
        })
        const user = DVCPopulatedUserFromDevCycleUser({ user_id: 'user_id' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event)

        const aggEvent = {
            type: EventTypes.aggVariableEvaluated,
            target: 'key',
        }
        eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(
            defaultLogger,
            'sdkKey',
            [
                {
                    user: expect.objectContaining({
                        user_id: 'user_id',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            clientDate: expect.any(String),
                            customType: 'test_event',
                            date: expect.any(String),
                            featureVars: {
                                '614ef6aa473928459060721a':
                                    '6153553b8cf4e45e0464268d',
                            },
                            type: 'customEvent',
                            user_id: 'user_id',
                        }),
                    ],
                },
                {
                    user: expect.objectContaining({
                        user_id: 'uuid@host.name',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key',
                            clientDate: expect.any(String),
                            date: expect.any(String),
                            user_id: 'uuid@host.name',
                            value: 1,
                            metaData: {
                                _feature: 'feature',
                                _variation: 'variation',
                            },
                        }),
                    ],
                },
            ],
            'localhost:3000/client/1',
        )
    })

    it('should prevent multiple concurrent flushes and resolve all promises', async () => {
        publishEvents_mock.mockResolvedValue(mockFetchResponse({ status: 201 }))

        const eventQueue = initEventQueue('sdkKey', 'uuid', {
            eventsAPIURI: 'localhost:3000/client/1',
        })
        const user = DVCPopulatedUserFromDevCycleUser({ user_id: 'user_id' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event)

        const aggEvent = {
            type: EventTypes.aggVariableEvaluated,
            target: 'key',
        }
        eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

        const promise1 = eventQueue.flushEvents()
        const promise2 = eventQueue.flushEvents()

        await Promise.all([promise1, promise2])
        expect(publishEvents_mock).toHaveBeenCalledTimes(1)
        expect(publishEvents_mock).toBeCalledWith(
            defaultLogger,
            'sdkKey',
            [
                {
                    user: expect.objectContaining({
                        user_id: 'user_id',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            clientDate: expect.any(String),
                            customType: 'test_event',
                            date: expect.any(String),
                            featureVars: {
                                '614ef6aa473928459060721a':
                                    '6153553b8cf4e45e0464268d',
                            },
                            type: 'customEvent',
                            user_id: 'user_id',
                        }),
                    ],
                },
                {
                    user: expect.objectContaining({
                        user_id: 'uuid@host.name',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key',
                            clientDate: expect.any(String),
                            date: expect.any(String),
                            user_id: 'uuid@host.name',
                            value: 1,
                            metaData: {
                                _feature: 'feature',
                                _variation: 'variation',
                            },
                        }),
                    ],
                },
            ],
            'localhost:3000/client/1',
        )

        eventQueue.queueEvent(user, event)
        await eventQueue.flushEvents()

        expect(publishEvents_mock).toHaveBeenCalledTimes(2)
        expect(publishEvents_mock).toBeCalledWith(
            defaultLogger,
            'sdkKey',
            [
                {
                    user: expect.objectContaining({
                        user_id: 'user_id',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            clientDate: expect.any(String),
                            customType: 'test_event',
                            date: expect.any(String),
                            featureVars: {
                                '614ef6aa473928459060721a':
                                    '6153553b8cf4e45e0464268d',
                            },
                            type: 'customEvent',
                            user_id: 'user_id',
                        }),
                    ],
                },
            ],
            'localhost:3000/client/1',
        )
        eventQueue.cleanup()
    })

    it(
        'should setup Event Queue and not process' +
            ' custom events if disableCustomEventLogging is true',
        async () => {
            publishEvents_mock.mockResolvedValue(
                mockFetchResponse({ status: 201 }),
            )

            const eventQueue = initEventQueue('sdkKey', 'uuid', {
                disableAutomaticEventLogging: false,
                disableCustomEventLogging: true,
            })
            const user = DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' })
            const event = { type: 'test_event' }
            eventQueue.queueEvent(user, event)

            const aggEvent = {
                type: EventTypes.aggVariableEvaluated,
                target: 'key',
            }
            eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

            await eventQueue.flushEvents()
            eventQueue.cleanup()

            expect(publishEvents_mock).toBeCalledTimes(1)
            expect(publishEvents_mock.mock.calls[0][2]).toEqual([
                {
                    user: expect.objectContaining({
                        user_id: 'uuid@host.name',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key',
                            clientDate: expect.any(String),
                            date: expect.any(String),
                            user_id: 'uuid@host.name',
                            value: 1,
                            metaData: {
                                _feature: 'feature',
                                _variation: 'variation',
                            },
                        }),
                    ],
                },
            ])
        },
    )

    it(
        'should setup Event Queue and not process ' +
            'automatic events if disableAutomaticEventLogging is true',
        async () => {
            publishEvents_mock.mockResolvedValue(
                mockFetchResponse({ status: 201 }),
            )

            const eventQueue = initEventQueue('sdkKey', 'uuid', {
                disableAutomaticEventLogging: true,
                disableCustomEventLogging: false,
            })
            const user = DVCPopulatedUserFromDevCycleUser({
                user_id: 'user_id',
            })
            const event = { type: 'test_event' }
            eventQueue.queueEvent(user, event)

            const aggEvent = {
                type: EventTypes.aggVariableEvaluated,
                target: 'key',
            }
            eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

            await eventQueue.flushEvents()
            eventQueue.cleanup()

            expect(publishEvents_mock).toBeCalledTimes(1)
            expect(publishEvents_mock.mock.calls[0][2]).toEqual([
                {
                    user: expect.objectContaining({
                        user_id: 'user_id',
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: expect.any(String),
                        sdkType: 'server',
                        sdkVersion: expect.any(String),
                    }),
                    events: [
                        expect.objectContaining({
                            clientDate: expect.any(String),
                            customType: 'test_event',
                            date: expect.any(String),
                            featureVars: {
                                '614ef6aa473928459060721a':
                                    '6153553b8cf4e45e0464268d',
                            },
                            type: 'customEvent',
                            user_id: 'user_id',
                        }),
                    ],
                },
            ])
        },
    )

    it('should save aggVariableDefaulted event', async () => {
        publishEvents_mock.mockResolvedValue(mockFetchResponse({ status: 201 }))

        const eventQueue = initEventQueue('sdkKey', 'uuid')
        const user1 = DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' })
        eventQueue.queueAggregateEvent(
            user1,
            { type: EventTypes.aggVariableDefaulted, target: 'unknown_key' },
            bucketedUserConfig,
        )
        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(
            defaultLogger,
            'sdkKey',
            [
                {
                    events: [
                        {
                            clientDate: expect.any(String),
                            date: expect.any(String),
                            featureVars: {},
                            target: 'unknown_key',
                            type: 'aggVariableDefaulted',
                            user_id: 'uuid@host.name',
                            value: 1,
                        },
                    ],
                    user: {
                        createdDate: expect.any(String),
                        lastSeenDate: expect.any(String),
                        platform: 'NodeJS',
                        platformVersion: '16.10.0',
                        sdkType: 'server',
                        sdkVersion: '1.0.0',
                        user_id: 'uuid@host.name',
                        hostname: 'host.name',
                    },
                },
            ],
            undefined,
        )
    })

    it('should save multiple events from multiple users with aggregated values', async () => {
        publishEvents_mock.mockResolvedValue(mockFetchResponse({ status: 201 }))

        const eventQueue = initEventQueue('sdkKey', 'uuid')
        const user1 = DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' })
        const user2 = DVCPopulatedUserFromDevCycleUser({ user_id: 'user2' })
        eventQueue.queueEvent(user1, { type: 'test_event_1' })
        eventQueue.queueEvent(user1, { type: 'test_event_2' })

        eventQueue.queueEvent(user2, { type: 'test_event_3' })
        eventQueue.queueEvent(user2, { type: 'test_event_4' })

        eventQueue.queueAggregateEvent(
            user1,
            { type: EventTypes.aggVariableEvaluated, target: 'key_1' },
            bucketedUserConfig,
        )
        eventQueue.queueAggregateEvent(
            user2,
            { type: EventTypes.aggVariableEvaluated, target: 'key_3' },
            bucketedUserConfig,
        )
        eventQueue.queueAggregateEvent(
            user2,
            { type: EventTypes.aggVariableEvaluated, target: 'key_4' },
            bucketedUserConfig,
        )
        eventQueue.queueAggregateEvent(
            user2,
            { type: EventTypes.aggVariableEvaluated, target: 'key_4' },
            bucketedUserConfig,
        )
        eventQueue.queueAggregateEvent(
            user2,
            { type: EventTypes.aggVariableDefaulted, target: 'key_4' },
            bucketedUserConfig,
        )

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(
            defaultLogger,
            'sdkKey',
            [
                {
                    user: expect.objectContaining({ user_id: 'user1' }),
                    events: [
                        expect.objectContaining({
                            customType: 'test_event_1',
                            type: 'customEvent',
                            user_id: 'user1',
                        }),
                        expect.objectContaining({
                            customType: 'test_event_2',
                            type: 'customEvent',
                            user_id: 'user1',
                        }),
                    ],
                },
                {
                    user: expect.objectContaining({ user_id: 'user2' }),
                    events: [
                        expect.objectContaining({
                            customType: 'test_event_3',
                            type: 'customEvent',
                            user_id: 'user2',
                        }),
                        expect.objectContaining({
                            customType: 'test_event_4',
                            type: 'customEvent',
                            user_id: 'user2',
                        }),
                    ],
                },
                {
                    user: expect.objectContaining({
                        user_id: 'uuid@host.name',
                    }),
                    events: [
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key_1',
                            value: 1,
                            user_id: 'uuid@host.name',
                        }),
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key_3',
                            value: 1,
                            user_id: 'uuid@host.name',
                        }),
                        expect.objectContaining({
                            type: 'aggVariableEvaluated',
                            target: 'key_4',
                            value: 2,
                            user_id: 'uuid@host.name',
                        }),
                        expect.objectContaining({
                            type: 'aggVariableDefaulted',
                            target: 'key_4',
                            value: 1,
                            user_id: 'uuid@host.name',
                        }),
                    ],
                },
            ],
            undefined,
        )
    })

    it('should handle event request failures and re-queue events', async () => {
        const eventQueue = initEventQueue('sdkKey', 'uuid')
        const user = DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' })
        const user2 = DVCPopulatedUserFromDevCycleUser({ user_id: 'user2' })
        eventQueue.queueEvent(user, { type: 'test_event' })

        const aggEvent = {
            type: EventTypes.aggVariableEvaluated,
            target: 'key',
        }
        eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)

        publishEvents_mock.mockImplementation(async () => {
            // Queue event during request to see if merging failed events works
            eventQueue.queueEvent(user, { type: 'test_event_2' })
            eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)
            eventQueue.queueAggregateEvent(user, aggEvent, bucketedUserConfig)
            eventQueue.queueAggregateEvent(user2, aggEvent, bucketedUserConfig)

            return mockFetchResponse({ status: 500 })
        })

        await eventQueue.flushEvents()
        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledTimes(3)
        expect(publishEvents_mock.mock.calls[0][2]).toEqual([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' }),
                ]),
            },
            {
                user: expect.objectContaining({ user_id: 'uuid@host.name' }),
                events: expect.arrayContaining([
                    expect.objectContaining({
                        type: 'aggVariableEvaluated',
                        target: 'key',
                        value: 1,
                    }),
                ]),
            },
        ])
        // Second call should be the same failed call from the first request
        expect(publishEvents_mock.mock.calls[1][2]).toEqual(
            publishEvents_mock.mock.calls[0][2],
        )
        expect(publishEvents_mock.mock.calls[2][2]).toEqual([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event_2' }),
                ]),
            },
            {
                user: expect.objectContaining({ user_id: 'uuid@host.name' }),
                events: expect.arrayContaining([
                    expect.objectContaining({
                        type: 'aggVariableEvaluated',
                        target: 'key',
                        value: 3,
                    }),
                ]),
            },
        ])
    })

    it(
        'should send request in chunks when ' +
            'there are too many events, and requeue just the failed ones',
        async () => {
            const eventQueue = initEventQueue('sdkKey', 'uuid')

            for (let i = 0; i < 150; i++) {
                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: `user${i}`,
                })
                eventQueue.queueEvent(user, { type: 'test_event' })
            }

            const varMap = { ...bucketedUserConfig.variableVariationMap }
            for (let i = 0; i < 150; i++) {
                const key = `key${i}`
                const aggEvent = {
                    type: EventTypes.aggVariableEvaluated,
                    target: key,
                }
                varMap[key] = { _feature: 'feature', _variation: 'variation' }
                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: `user${i}`,
                })
                eventQueue.queueAggregateEvent(user, aggEvent, {
                    ...bucketedUserConfig,
                    variableVariationMap: varMap,
                })
            }

            // 300 events total, that's three chunks
            publishEvents_mock.mockResolvedValueOnce(
                mockFetchResponse({ status: 201 }),
            )
            // fail on the second chunk
            publishEvents_mock.mockResolvedValueOnce(
                mockFetchResponse({ status: 500 }),
            )
            publishEvents_mock.mockResolvedValue(
                mockFetchResponse({ status: 201 }),
            )

            await eventQueue.flushEvents()
            expect(publishEvents_mock).toBeCalledTimes(3)

            // flush again to trigger the retry of the failed chunk
            await eventQueue.flushEvents()

            // first two calls are from first flush (two chunks)
            // third call is from second flush (retrying the failed chunk)
            expect(publishEvents_mock).toBeCalledTimes(4)
            const firstPublishPayloads = publishEvents_mock.mock.calls[0][2]
            const secondPublishPayloads = publishEvents_mock.mock.calls[1][2]
            const thirdPublishPayloads = publishEvents_mock.mock.calls[2][2]
            const fourthPublishPayloads = publishEvents_mock.mock.calls[3][2]

            expect(firstPublishPayloads).toEqual(
                expect.arrayContaining([
                    {
                        user: expect.objectContaining({ user_id: 'user1' }),
                        events: expect.arrayContaining([
                            expect.objectContaining({
                                customType: 'test_event',
                            }),
                        ]),
                    },
                ]),
            )

            expect(secondPublishPayloads).toEqual(
                expect.arrayContaining([
                    {
                        user: expect.objectContaining({ user_id: 'user104' }),
                        events: expect.arrayContaining([
                            expect.objectContaining({
                                customType: 'test_event',
                            }),
                        ]),
                    },
                    {
                        user: expect.objectContaining({
                            user_id: 'uuid@host.name',
                        }),
                        events: expect.arrayContaining([
                            expect.objectContaining({
                                type: 'aggVariableEvaluated',
                                value: 1,
                            }),
                        ]),
                    },
                ]),
            )

            expect(fourthPublishPayloads).toEqual(
                expect.arrayContaining([
                    {
                        user: expect.objectContaining({ user_id: 'user104' }),
                        events: expect.arrayContaining([
                            expect.objectContaining({
                                customType: 'test_event',
                            }),
                        ]),
                    },
                    {
                        user: expect.objectContaining({
                            user_id: 'uuid@host.name',
                        }),
                        events: expect.arrayContaining([
                            expect.objectContaining({
                                type: 'aggVariableEvaluated',
                                value: 1,
                            }),
                        ]),
                    },
                ]),
            )

            expect(
                firstPublishPayloads.reduce(
                    (val: number, payload) => val + payload.events.length,
                    0,
                ),
            ).toBe(100)

            expect(
                secondPublishPayloads.reduce(
                    (val: number, payload) => val + payload.events.length,
                    0,
                ),
            ).toBe(100)

            expect(
                thirdPublishPayloads.reduce(
                    (val: number, payload) => val + payload.events.length,
                    0,
                ),
            ).toBe(100)

            expect(
                fourthPublishPayloads.reduce(
                    (val: number, payload) => val + payload.events.length,
                    0,
                ),
            ).toBe(100)

            eventQueue.cleanup()
        },
    )

    it('should close the event queue if the events api response is 401', async () => {
        const eventQueue = initEventQueue('sdkKey', 'uuid')
        const error = new ResponseError('401 error')
        error.status = 401
        publishEvents_mock.mockRejectedValueOnce(error)
        eventQueue.queueEvent(
            DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' }),
            { type: 'test_event' },
        )
        await eventQueue.flushEvents()

        expect(eventQueue.disabledEventFlush).toBe(true)

        eventQueue.queueEvent(
            DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' }),
            { type: 'test_event' },
        )
        eventQueue.queueAggregateEvent(
            DVCPopulatedUserFromDevCycleUser({ user_id: 'user1' }),
            { type: EventTypes.aggVariableEvaluated, target: 'key' },
            bucketedUserConfig,
        )
        await eventQueue.flushEvents()
    })

    describe('Max queue size tests', () => {
        it(
            'should not queue user event if user' +
                ' event and aggregate event queue exceeds max event queue size',
            () => {
                console.log('test 1')
                const logger = dvcDefaultLogger()
                logger.warn = jest.fn()

                const sdkKey = 'sdkKey'
                const eventQueue = initEventQueue(sdkKey, 'uuid', { logger })
                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: 'user1',
                })

                for (let i = 0; i < 500; i++) {
                    const target = `key${i}`
                    const aggEvent = {
                        type: EventTypes.aggVariableEvaluated,
                        target,
                    }
                    eventQueue.queueAggregateEvent(user, aggEvent, {
                        ...bucketedUserConfig,
                        variableVariationMap: {
                            [target]: { _feature: 'feat', _variation: 'var' },
                        },
                    })
                }

                for (let i = 0; i < 500; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1000)

                for (let i = 0; i < 1000; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(2000)

                eventQueue.queueEvent(user, { type: 'test_event2' })

                expect(logger.warn).toBeCalledTimes(1)
                expect(logger.warn).toBeCalledWith(
                    expect.stringContaining(
                        'Max event queue size reached, dropping event',
                    ),
                )
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(2000)
            },
        )

        it(
            'should not queue aggregate event if user event and aggregate event queue' +
                ' exceeds max event queue size',
            () => {
                const logger = dvcDefaultLogger()
                logger.warn = jest.fn()

                const sdkKey = 'sdkKey'
                const eventQueue = initEventQueue(sdkKey, 'uuid', { logger })
                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: 'user1',
                })

                for (let i = 0; i < 500; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                for (let i = 0; i < 500; i++) {
                    const target = `key${i}`
                    const aggEvent = {
                        type: EventTypes.aggVariableEvaluated,
                        target,
                    }
                    eventQueue.queueAggregateEvent(user, aggEvent, {
                        ...bucketedUserConfig,
                        variableVariationMap: {
                            [target]: { _feature: 'feat', _variation: 'var' },
                        },
                    })
                }
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1000)

                for (let i = 0; i < 1000; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(2000)

                eventQueue.queueAggregateEvent(
                    user,
                    {
                        type: EventTypes.aggVariableEvaluated,
                        target: 'key_test_2',
                    },
                    bucketedUserConfig,
                )

                expect(logger.warn).toBeCalledTimes(1)
                expect(logger.warn).toBeCalledWith(
                    expect.stringContaining(
                        'Max event queue size reached, dropping aggregate event',
                    ),
                )
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(2000)
            },
        )

        it(
            'should flush event queues once max queue size has been reached before' +
                ' adding another user event',
            async () => {
                const sdkKey = 'sdkKey'
                const eventQueue = initEventQueue(sdkKey, 'uuid')
                const flushEvents_mock = jest.spyOn(eventQueue, 'flushEvents')
                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: 'user1',
                })

                // set eventQueueSize to 1000
                for (let i = 0; i < 500; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                for (let i = 0; i < 500; i++) {
                    const target = `key${i}`
                    const aggEvent = {
                        type: EventTypes.aggVariableEvaluated,
                        target,
                    }
                    eventQueue.queueAggregateEvent(user, aggEvent, {
                        ...bucketedUserConfig,
                        variableVariationMap: {
                            [target]: { _feature: 'feat', _variation: 'var' },
                        },
                    })
                }
                expect(flushEvents_mock).toBeCalledTimes(0)
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1000)

                // since max event queue size has been reached, attempting to add a new user event will flush the queue
                eventQueue.queueEvent(user, { type: 'test_event' })
                expect(flushEvents_mock).toBeCalledTimes(1)
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1001)
            },
        )

        it(
            'should flush event queues once max queue size has been reached before ' +
                'adding another agg event',
            async () => {
                const sdkKey = 'sdkKey'
                const eventQueue = initEventQueue(sdkKey, 'uuid')
                const flushEvents_mock = jest.spyOn(eventQueue, 'flushEvents')

                const user = DVCPopulatedUserFromDevCycleUser({
                    user_id: 'user1',
                })

                // set eventQueueSize to 1000
                for (let i = 0; i < 500; i++) {
                    eventQueue.queueEvent(user, { type: 'test_event' })
                }
                for (let i = 0; i < 500; i++) {
                    const target = `key${i}`
                    const aggEvent = {
                        type: EventTypes.aggVariableEvaluated,
                        target,
                    }
                    eventQueue.queueAggregateEvent(user, aggEvent, {
                        ...bucketedUserConfig,
                        variableVariationMap: {
                            [target]: { _feature: 'feat', _variation: 'var' },
                        },
                    })
                }
                expect(flushEvents_mock).toBeCalledTimes(0)
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1000)

                // since max event queue size has been reached, attempting to add a new agg event will flush the queue
                eventQueue.queueAggregateEvent(
                    user,
                    {
                        type: EventTypes.aggVariableEvaluated,
                        target: 'key_final',
                    },
                    {
                        ...bucketedUserConfig,
                        variableVariationMap: {
                            key_final: { _feature: 'feat', _variation: 'var' },
                        },
                    },
                )
                expect(flushEvents_mock).toBeCalledTimes(1)
                expect(bucketing.eventQueueSize(sdkKey)).toEqual(1001)
            },
        )
    })

    describe('EventQueue init validation', () => {
        it('should validate flushEventsMS', () => {
            expect(
                () =>
                    new EventQueue('test', 'uuid', bucketing, {
                        logger: defaultLogger,
                        eventFlushIntervalMS: 400,
                    }),
            ).toThrow('eventFlushIntervalMS: 400 must be larger than 500ms')
            expect(
                () =>
                    new EventQueue('test', 'uuid', bucketing, {
                        logger: defaultLogger,
                        eventFlushIntervalMS: 10 * 60 * 1000,
                    }),
            ).toThrow(
                `eventFlushIntervalMS: ${
                    10 * 60 * 1000
                } must be smaller than 1 minute`,
            )
        })

        it('should validate flushEventQueueSize and maxEventQueueSize', () => {
            expect(
                () =>
                    new EventQueue('test', 'uuid', bucketing, {
                        logger: defaultLogger,
                        flushEventQueueSize: 2000,
                        maxEventQueueSize: 2000,
                    }),
            ).toThrow(
                'flushEventQueueSize: 2000 must be smaller than maxEventQueueSize: 2000',
            )

            expect(
                () =>
                    new EventQueue('test', 'uuid', bucketing, {
                        logger: defaultLogger,
                        flushEventQueueSize: 1000,
                        maxEventQueueSize: 2000,
                        eventRequestChunkSize: 4000,
                    }),
            ).toThrow(
                'flushEventQueueSize: 1000 and maxEventQueueSize: 2000 ' +
                    'must be smaller than eventRequestChunkSize: 4000',
            )

            expect(
                () =>
                    new EventQueue('test', 'uuid', bucketing, {
                        logger: defaultLogger,
                        flushEventQueueSize: 25000,
                        maxEventQueueSize: 40000,
                    }),
            ).toThrow(
                'flushEventQueueSize: 25000 or maxEventQueueSize: 40000 ' +
                    'must be smaller than 20,000',
            )
        })

        it('should not pass in logger to bucketing', () => {
            const spy = jest.spyOn(bucketing, 'initEventQueue')
            const options = {
                logger: defaultLogger,
                eventRequestChunkSize: 1000,
                disableAutomaticEventLogging: true,
                disableCustomEventLogging: false,
            }
            new EventQueue('test', 'uuid', bucketing, options)
            const spyOptions = JSON.parse(spy.mock.calls[0][2])
            expect(spyOptions.logger).toBeUndefined()
        })
    })
})
