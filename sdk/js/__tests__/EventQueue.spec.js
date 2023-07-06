import * as Request from '../src/Request'
import { DevCycleClient } from '../src/Client'
import { EventQueue, EventTypes } from '../src/EventQueue'
let eventQueue, dvcClient

describe('EventQueue tests', () => {
    beforeAll(() => {
        dvcClient = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
        dvcClient.config = { features: [] }
        eventQueue = new EventQueue('test_sdk_key', dvcClient)
    })

    beforeEach(() => {
        Request.publishEvents = jest.fn()
        eventQueue.eventQueue = []
        eventQueue.aggregateEventMap = {}
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
