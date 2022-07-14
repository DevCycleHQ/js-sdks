import { DVCPopulatedUser } from '../src/models/populatedUser'

jest.mock('../src/request')

import { AxiosResponse } from 'axios'
import { EventQueue } from '../src/eventQueue'
import { EventTypes } from '../src/models/requestEvent'
import { publishEvents } from '../src/request'
import { BucketedUserConfig, PublicProject } from '@devcycle/types'
import { mocked } from 'ts-jest/utils'
import { dvcDefaultLogger } from '../src/utils/logger'

const publishEvents_mock = mocked(publishEvents, true)
const logger = dvcDefaultLogger()

describe('EventQueue Unit Tests', () => {
    const config: BucketedUserConfig = {
        environment: { _id: '', key: '' },
        features: {},
        knownVariableKeys: [],
        project: { _id: '', key: '', a0_organization: 'org_' } as PublicProject,
        variables: {},
        featureVariationMap: { feature: 'var' }
    }
    const mockAxiosResponse = (obj: any): AxiosResponse => ({
        status: 200,
        statusText: '',
        data: {},
        headers: {},
        config: {},
        ...obj
    })

    afterEach(() => publishEvents_mock.mockReset())

    it('should setup Event Queue and process events', async () => {
        publishEvents_mock.mockResolvedValue(mockAxiosResponse({ status: 201 }))

        const eventQueue = new EventQueue(logger, 'envKey')
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event, config)

        const aggEvent = { type: EventTypes.variableEvaluated, target: 'key' }
        eventQueue.queueAggregateEvent(user, aggEvent, config)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(logger, 'envKey', [
            {
                user: expect.objectContaining({
                    user_id: 'user1',
                    createdDate: expect.any(Date),
                    lastSeenDate: expect.any(Date),
                    platform: 'NodeJS',
                    platformVersion: expect.any(String),
                    sdkType: 'server',
                    sdkVersion: expect.any(String)
                }),
                events: [
                    expect.objectContaining({
                        clientDate: expect.any(Number),
                        customType: 'test_event',
                        date: expect.any(Number),
                        featureVars: { 'feature': 'var' },
                        type: 'customEvent',
                        user_id: 'user1'
                    }),
                    expect.objectContaining({
                        type: 'variableEvaluated',
                        target: 'key',
                        clientDate: expect.any(Number),
                        date: expect.any(Number),
                        featureVars: { 'feature': 'var' },
                        user_id: 'user1',
                        value: 1
                    })
                ]
            }
        ])
    })

    it('should setup Event Queue and not process custom events if disableCustomEventLogging is true', async () => {
        publishEvents_mock.mockResolvedValue(mockAxiosResponse({ status: 201 }))

        const eventQueue = new EventQueue(logger, 'envKey',
            {
                disableAutomaticEventLogging: false,
                disableCustomEventLogging: true
            })
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event, config)

        const aggEvent = { type: EventTypes.variableEvaluated, target: 'key' }
        eventQueue.queueAggregateEvent(user, aggEvent, config)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(logger, 'envKey', [
            {
                user: expect.objectContaining({
                    user_id: 'user1',
                    createdDate: expect.any(Date),
                    lastSeenDate: expect.any(Date),
                    platform: 'NodeJS',
                    platformVersion: expect.any(String),
                    sdkType: 'server',
                    sdkVersion: expect.any(String)
                }),
                events: [
                    expect.objectContaining({
                        type: 'variableEvaluated',
                        target: 'key',
                        clientDate: expect.any(Number),
                        date: expect.any(Number),
                        featureVars: { 'feature': 'var' },
                        user_id: 'user1',
                        value: 1
                    })
                ]
            }
        ])
    })

    it('should setup Event Queue and not process automatic events if disableAutomaticEventLogging is true',
        async () => {
        publishEvents_mock.mockResolvedValue(mockAxiosResponse({ status: 201 }))

        const eventQueue = new EventQueue(logger, 'envKey',
            {
                disableAutomaticEventLogging: true,
                disableCustomEventLogging: false
            })
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        const event = { type: 'test_event' }
        eventQueue.queueEvent(user, event, config)

        const aggEvent = { type: EventTypes.variableEvaluated, target: 'key' }
        eventQueue.queueAggregateEvent(user, aggEvent, config)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(logger, 'envKey', [
            {
                user: expect.objectContaining({
                    user_id: 'user1',
                    createdDate: expect.any(Date),
                    lastSeenDate: expect.any(Date),
                    platform: 'NodeJS',
                    platformVersion: expect.any(String),
                    sdkType: 'server',
                    sdkVersion: expect.any(String)
                }),
                events: [
                    expect.objectContaining({
                        clientDate: expect.any(Number),
                        customType: 'test_event',
                        date: expect.any(Number),
                        featureVars: { 'feature': 'var' },
                        type: 'customEvent',
                        user_id: 'user1'
                    })
                ]
            }
        ])
    })

    it('should save multiple events from multiple users with aggregated values', async () => {
        publishEvents_mock.mockResolvedValue(mockAxiosResponse({ status: 201 }))

        const eventQueue = new EventQueue(logger, 'envKey')
        const user1 = new DVCPopulatedUser({ user_id: 'user1' })
        const user2 = new DVCPopulatedUser({ user_id: 'user2' })
        eventQueue.queueEvent(user1, { type: 'test_event_1' }, config)
        eventQueue.queueEvent(user1, { type: 'test_event_2' }, config)

        eventQueue.queueEvent(user2, { type: 'test_event_3' }, config)
        eventQueue.queueEvent(user2, { type: 'test_event_4' }, config)

        eventQueue.queueAggregateEvent(user1, { type: EventTypes.variableEvaluated, target: 'key_1' }, config)
        eventQueue.queueAggregateEvent(user2, { type: EventTypes.variableEvaluated, target: 'key_3' }, config)
        eventQueue.queueAggregateEvent(user2, { type: EventTypes.variableEvaluated, target: 'key_4' }, config)
        eventQueue.queueAggregateEvent(user2, { type: EventTypes.variableEvaluated, target: 'key_4' }, config)

        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledWith(logger, 'envKey', [
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: [
                    expect.objectContaining({
                        customType: 'test_event_1',
                        type: 'customEvent',
                        user_id: 'user1'
                    }),
                    expect.objectContaining({
                        customType: 'test_event_2',
                        type: 'customEvent',
                        user_id: 'user1'
                    }),
                    expect.objectContaining({
                        type: 'variableEvaluated',
                        target: 'key_1',
                        value: 1,
                        user_id: 'user1'
                    })
                ]
            },
            {
                user: expect.objectContaining({ user_id: 'user2' }),
                events: [
                    expect.objectContaining({
                        customType: 'test_event_3',
                        type: 'customEvent',
                        user_id: 'user2'
                    }),
                    expect.objectContaining({
                        customType: 'test_event_4',
                        type: 'customEvent',
                        user_id: 'user2'
                    }),
                    expect.objectContaining({
                        type: 'variableEvaluated',
                        target: 'key_3',
                        value: 1,
                        user_id: 'user2'
                    }),
                    expect.objectContaining({
                        type: 'variableEvaluated',
                        target: 'key_4',
                        value: 2,
                        user_id: 'user2'
                    })
                ]
            }
        ])
    })

    it('should handle event request failures and re-queue events', async () => {
        const eventQueue = new EventQueue(logger, 'envKey')
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        const user2 = new DVCPopulatedUser({ user_id: 'user2' })
        eventQueue.queueEvent(user, { type: 'test_event' }, config)

        const aggEvent = { type: EventTypes.variableEvaluated, target: 'key' }
        eventQueue.queueAggregateEvent(user, aggEvent, config)

        publishEvents_mock.mockImplementation(async () => {
            // Queue event during request to see if merging failed events works
            eventQueue.queueEvent(user, { type: 'test_event_2' }, config)
            eventQueue.queueAggregateEvent(user, aggEvent, config)
            eventQueue.queueAggregateEvent(user, aggEvent, config)
            eventQueue.queueAggregateEvent(user2, aggEvent, config)

            return mockAxiosResponse({ status: 500 })
        })

        await eventQueue.flushEvents()
        await eventQueue.flushEvents()
        eventQueue.cleanup()

        expect(publishEvents_mock).toBeCalledTimes(2)
        expect(publishEvents_mock.mock.calls[0][2]).toEqual([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' }),
                    expect.objectContaining({ type: 'variableEvaluated', value: 1 })
                ])
            }
        ])
        // Second call should include merged event that was queued during request
        expect(publishEvents_mock.mock.calls[1][2]).toEqual([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' }),
                    expect.objectContaining({ customType: 'test_event_2' }),
                    expect.objectContaining({ type: 'variableEvaluated', value: 3 })
                ])
            },
            {
                user: expect.objectContaining({ user_id: 'user2' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ type: 'variableEvaluated', value: 1 })
                ])
            }
        ])
    })

    it('should send request in chunks when there are too many events, and requeue just the failed ones', async () => {
        const eventQueue = new EventQueue(logger, 'envKey')
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        const aggEvent = { type: EventTypes.variableEvaluated, target: 'key' }

        for (let i = 0; i < 150; i++) {
            eventQueue.queueEvent(user, { type: 'test_event' }, config)
        }

        for (let i = 0; i < 150; i++) {
            eventQueue.queueAggregateEvent(new DVCPopulatedUser({ user_id: `user${i}` }), aggEvent, config)
        }

        // 300 events total, thats three chunks

        publishEvents_mock.mockResolvedValueOnce(mockAxiosResponse({ status: 201 }))
        // fail on the second chunk
        publishEvents_mock.mockResolvedValueOnce(mockAxiosResponse({ status: 500 }))
        publishEvents_mock.mockResolvedValue(mockAxiosResponse({ status: 201 }))

        await eventQueue.flushEvents()
        // flush again to trigger the retry of the failed chunk
        await eventQueue.flushEvents()
        eventQueue.cleanup()

        // first two calls are from first flush (two chunks)
        // third call is from second flush (retrying the failed chunk)
        expect(publishEvents_mock).toBeCalledTimes(4)
        const firstPublishPayloads = publishEvents_mock.mock.calls[0][2]
        const secondPublishPayloads = publishEvents_mock.mock.calls[1][2]
        const thirdPublishPayloads = publishEvents_mock.mock.calls[2][2]
        const fourthPublishPayloads = publishEvents_mock.mock.calls[3][2]

        expect(firstPublishPayloads).toEqual([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' })
                ])
            }
        ])

        expect(secondPublishPayloads).toEqual(expect.arrayContaining([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' })
                ])
            },
            {
                user: expect.objectContaining({ user_id: 'user20' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ type: 'variableEvaluated', value: 1 })
                ])
            }
        ]))

        expect(fourthPublishPayloads).toEqual(expect.arrayContaining([
            {
                user: expect.objectContaining({ user_id: 'user1' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ customType: 'test_event' })
                ])
            },
            {
                user: expect.objectContaining({ user_id: 'user20' }),
                events: expect.arrayContaining([
                    expect.objectContaining({ type: 'variableEvaluated', value: 1 })
                ])
            }
        ]))

        expect(
            firstPublishPayloads.reduce((val: number, payload) => val + payload.events.length, 0)
        ).toBe(100)

        expect(
            secondPublishPayloads.reduce((val: number, payload) => val + payload.events.length, 0)
        ).toBe(100)

        expect(
            thirdPublishPayloads.reduce((val: number, payload) => val + payload.events.length, 0)
        ).toBe(100)

        expect(
            fourthPublishPayloads.reduce((val: number, payload) => val + payload.events.length, 0)
        ).toBe(100)
    })
})
