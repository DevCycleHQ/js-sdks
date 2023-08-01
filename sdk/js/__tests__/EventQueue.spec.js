import * as Request from '../src/Request'
import { DevCycleClient } from '../src/Client'
import { EventQueue, EventTypes } from '../src/EventQueue'
let eventQueue, dvcClient

const loggerMock = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

describe('EventQueue tests', () => {
    beforeAll(() => {
        dvcClient = new DevCycleClient(
            'test_sdk_key',
            { user_id: 'user1' },
            { logger: loggerMock },
        )
        dvcClient.config = { features: [] }
        eventQueue = new EventQueue('test_sdk_key', dvcClient, {
            flushEventQueueSize: 10,
            maxEventQueueSize: 100,
        })
    })

    beforeEach(() => {
        Request.publishEvents = jest.fn()
        eventQueue.eventQueue = []
        eventQueue.aggregateEventMap = {}
    })

    describe('initialization options', () => {
        it('should throw error for low eventFlushIntervalMS', async () => {
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        eventFlushIntervalMS: 0,
                    }),
            ).toThrow(`eventFlushIntervalMS: 0 must be larger than 500ms`)
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        eventFlushIntervalMS: 100,
                    }),
            ).toThrow(`eventFlushIntervalMS: 100 must be larger than 500ms`)
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        eventFlushIntervalMS: 500 * 1000,
                    }),
            ).toThrow(
                `eventFlushIntervalMS: 500000 must be smaller than 1 minute`,
            )
        })

        it('should throw error for incorrect flushEventQueueSize or maxEventQueueSize', () => {
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        flushEventQueueSize: 10000,
                        maxEventQueueSize: 1000,
                    }),
            ).toThrow(
                'flushEventQueueSize: 10000 must be smaller than maxEventQueueSize: 1000',
            )
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        flushEventQueueSize: 5,
                    }),
            ).toThrow('flushEventQueueSize: 5 must be between 10 and 1000')
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        flushEventQueueSize: 5000,
                        maxEventQueueSize: 10000,
                    }),
            ).toThrow('flushEventQueueSize: 5000 must be between 10 and 1000')
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        flushEventQueueSize: 10,
                        maxEventQueueSize: 50,
                    }),
            ).toThrow('maxEventQueueSize: 50 must be between 100 and 5000')
            expect(
                () =>
                    new EventQueue('test_sdk_key', dvcClient, {
                        maxEventQueueSize: 5500,
                    }),
            ).toThrow('maxEventQueueSize: 5500 must be between 100 and 5000')
        })
    })

    describe('queueEvent', () => {
        it('should flush queued event', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })
            const event = { type: 'test_type' }
            eventQueue.queueEvent(event)
            await eventQueue.flushEvents()

            expect(Request.publishEvents).toBeCalledWith(
                'test_sdk_key',
                dvcClient.config,
                dvcClient.user,
                expect.any(Object),
                expect.any(Object),
            )
        })

        it('should drop event if eventQueueSize is larger than maxEventQueueSize', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })

            for (let i = 0; i < 100; i++) {
                const event = { type: 'test_type_' + i }
                eventQueue.eventQueue.push(event)
            }
            const event = { type: 'test_type' }
            eventQueue.queueEvent(event)

            expect(Request.publishEvents).toHaveBeenCalled()
            expect(loggerMock.warn).toBeCalledWith(
                `DevCycle: Max event queue size (100) reached, dropping event: ${event}`,
            )
        })

        it('should make multiple batched requests', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })
            const events = []

            for (let i = 0; i < 200; i++) {
                const event = { type: 'test_type_' + i }
                eventQueue.eventQueue.push(event)
                events.push(event)
            }

            await eventQueue.flushEvents()

            expect(Request.publishEvents).toHaveBeenCalledTimes(2)
            expect(Request.publishEvents).toHaveBeenNthCalledWith(
                1,
                'test_sdk_key',
                dvcClient.config,
                dvcClient.user,
                events.slice(0, 100),
                expect.any(Object),
            )
            expect(Request.publishEvents).toHaveBeenNthCalledWith(
                2,
                'test_sdk_key',
                dvcClient.config,
                dvcClient.user,
                events.slice(100, 200),
                expect.any(Object),
            )
        })

        it('should flush multiple times calling queueEvent', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })

            for (let i = 0; i < 200; i++) {
                const event = { type: 'test_type_' + i }
                eventQueue.queueEvent(event)
            }

            expect(Request.publishEvents).toHaveBeenCalledTimes(19)
            await eventQueue.flushEvents()
            expect(Request.publishEvents).toHaveBeenCalledTimes(20)
        })

        it('should handle retry publish request error', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })
            Request.publishEvents.mockResolvedValueOnce({ status: 500 })
            const events = []

            for (let i = 0; i < 200; i++) {
                const event = { type: 'test_type_' + i }
                eventQueue.eventQueue.push(event)
                events.push(event)
            }

            await eventQueue.flushEvents()

            expect(Request.publishEvents).toHaveBeenCalledTimes(2)
            expect(eventQueue.eventQueue).toEqual(events.slice(0, 100))

            await eventQueue.flushEvents()
            expect(Request.publishEvents).toHaveBeenCalledTimes(3)
            expect(eventQueue.eventQueue).toEqual([])
        })
    })

    describe('queueAggregateEvents', () => {
        it('should throw if event does not have both target and type defined', () => {
            const eventNoTarget = {
                type: EventTypes.variableEvaluated,
                clientDate: Date.now(),
            }
            const eventNoType = {
                target: 'variable_key',
                clientDate: Date.now(),
            }
            expect(() => eventQueue.queueAggregateEvent(eventNoTarget)).toThrow(
                expect.any(Error),
            )
            expect(() => eventQueue.queueAggregateEvent(eventNoType)).toThrow(
                expect.any(Error),
            )
        })

        it('aggregates evaluated events and default events', async () => {
            const event1 = {
                type: EventTypes.variableEvaluated,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            const event2 = { ...event1, clientDate: Date.now() }
            const defaultEvent1 = {
                type: EventTypes.variableDefaulted,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            const defaultEvent2 = {
                type: EventTypes.variableDefaulted,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            eventQueue.queueAggregateEvent(event1)
            eventQueue.queueAggregateEvent(event2)
            eventQueue.queueAggregateEvent(defaultEvent1)
            eventQueue.queueAggregateEvent(defaultEvent2)

            const aggregateEvaluatedEvent =
                eventQueue.aggregateEventMap[EventTypes.variableEvaluated][
                    'dummy_key1'
                ]
            const aggregateDefaultedEvent =
                eventQueue.aggregateEventMap[EventTypes.variableDefaulted][
                    'dummy_key1'
                ]

            expect(aggregateEvaluatedEvent).toBeDefined()
            expect(aggregateEvaluatedEvent.value).toBe(2)

            expect(aggregateDefaultedEvent).toBeDefined()
            expect(aggregateDefaultedEvent.value).toBe(2)
        })

        it('aggregates with the proper value after flushing', async () => {
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }

            eventQueue.queueAggregateEvent(event)
            expect(
                eventQueue.aggregateEventMap[EventTypes.variableEvaluated][
                    'dummy_key1'
                ].value,
            ).toBe(1)
            eventQueue.aggregateEventMap = {}

            eventQueue.queueAggregateEvent(event)
            expect(
                eventQueue.aggregateEventMap[EventTypes.variableEvaluated][
                    'dummy_key1'
                ].value,
            ).toBe(1)
        })

        it('should drop event if eventQueueSize is larger than maxEventQueueSize', async () => {
            Request.publishEvents.mockResolvedValue({ status: 201 })

            for (let i = 0; i < 50; i++) {
                const event = { type: 'test_type_' + i }
                eventQueue.eventQueue.push(event)
            }

            eventQueue.aggregateEventMap[EventTypes.variableEvaluated] = {}
            for (let i = 0; i < 50; i++) {
                const event = {
                    type: EventTypes.variableEvaluated,
                    target: 'dummy_key_' + i,
                    clientDate: Date.now(),
                }
                eventQueue.aggregateEventMap[EventTypes.variableEvaluated][
                    event.target
                ] = event
            }
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'dummy_key',
                clientDate: Date.now(),
            }
            eventQueue.queueAggregateEvent(event)

            expect(Request.publishEvents).toHaveBeenCalled()
            expect(loggerMock.warn).toBeCalledWith(
                `DevCycle: Max event queue size (100) reached, dropping event: ${event}`,
            )
        })
    })

    describe('eventsFromAggregateEventMap', () => {
        it('should add all events in aggregate event map to a flattened array', () => {
            const event1 = {
                type: EventTypes.variableEvaluated,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            const event2 = { ...event1, clientDate: Date.now() }
            const defaultEvent1 = {
                type: EventTypes.variableDefaulted,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            const defaultEvent2 = {
                type: EventTypes.variableDefaulted,
                target: 'dummy_key1',
                clientDate: Date.now(),
            }
            eventQueue.queueAggregateEvent(event1)
            eventQueue.queueAggregateEvent(event2)
            eventQueue.queueAggregateEvent(defaultEvent1)
            eventQueue.queueAggregateEvent(defaultEvent2)
            const eventArray = eventQueue.eventsFromAggregateEventMap()
            expect(eventArray[0].type).toBe(EventTypes.variableEvaluated)
            expect(eventArray[0].value).toBe(2)
            expect(eventArray[1].type).toBe(EventTypes.variableDefaulted)
            expect(eventArray[1].value).toBe(2)
        })
    })

    describe('close', () => {
        it('should flush events and clear flush interval', async () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
            Request.publishEvents.mockResolvedValue({ status: 201 })

            eventQueue.queueEvent({ type: 'test_type' })
            await eventQueue.close()

            expect(Request.publishEvents).toBeCalledWith(
                'test_sdk_key',
                dvcClient.config,
                dvcClient.user,
                expect.any(Object),
                expect.any(Object),
            )

            expect(eventQueue.eventQueue).toHaveLength(0)

            expect(clearIntervalSpy).toHaveBeenCalledWith(
                eventQueue.flushInterval,
            )
        })
    })
})
