import { DVCEvent } from './types'
import { publishEvents } from './request'
import { checkParamDefined, checkParamString } from './utils/paramUtils'
import { DVCRequestEvent } from './models/requestEvent'
import { DVCPopulatedUser } from './models/populatedUser'
import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { chunk } from 'lodash'

export const AggregateEventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

export const EventTypes: Record<string, string> = {
    ...AggregateEventTypes
}

type EventsMap = Record<string, Record<string, DVCRequestEvent>>
type UserEventsMap = {
    user: DVCPopulatedUser,
    events: EventsMap
}
type AggregateUserEventMap = Record<string, UserEventsMap>

type UserEventsBatchRecord = {
    user: DVCPopulatedUser,
    events: DVCRequestEvent[]
}
export type FlushPayload = UserEventsBatchRecord[]
type UserEventQueue = Record<string, UserEventsBatchRecord>

type options = {
    flushEventsMS?: number,
    disableAutomaticEventLogging?: boolean,
    disableCustomEventLogging?: boolean
}
export class EventQueue {
    private readonly logger: DVCLogger
    private readonly environmentKey: string
    private userEventQueue: UserEventQueue
    private aggregateUserEventMap: AggregateUserEventMap
    flushEventsMS: number
    disableAutomaticEventLogging: boolean
    disableCustomEventLogging: boolean
    private flushInterval: NodeJS.Timer

    constructor(logger: DVCLogger, environmentKey: string, options?: options) {
        this.logger = logger
        this.environmentKey = environmentKey
        this.userEventQueue = {}
        this.aggregateUserEventMap = {}
        this.flushEventsMS = options?.flushEventsMS || 10 * 1000
        this.disableAutomaticEventLogging = options?.disableAutomaticEventLogging || false
        this.disableCustomEventLogging = options?.disableCustomEventLogging || false

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.flushEventsMS)
    }

    cleanup(): void {
        clearInterval(this.flushInterval)
    }

    /**
     * Flush events in queue to DevCycle Events API. Requeue events if flush fails
     */
    async flushEvents(): Promise<void> {
        const flushPayloads = this.constructFlushPayloads(100)
        if (!flushPayloads.length) {
            return
        }

        const innerReducer = (val: number, batch: UserEventsBatchRecord) => val + batch.events.length
        const reducer = (val: number, batches: UserEventsBatchRecord[]) => val + batches.reduce(innerReducer, 0)
        const eventCount = flushPayloads.reduce(reducer, 0)
        this.logger.debug(`DVC Flush ${eventCount} Events, for ${flushPayloads.length} Users`)

        this.userEventQueue = {}
        this.aggregateUserEventMap = {}

        await Promise.all(flushPayloads.map(async (flushPayload) => {
            try {
                const res = await publishEvents(this.logger, this.environmentKey, flushPayload)
                if (res.status !== 201) {
                    throw new Error(`Error publishing events, status: ${res.status}, body: ${res.data}`)
                } else {
                    this.logger.debug(`DVC Flushed ${eventCount} Events, for ${chunk.length} Users`)
                }
            } catch (ex) {
                this.logger.error(`DVC Error Flushing Events response message: ${ex.message}, ` +
                    `response data: ${ex?.response?.data}`)
                this.requeueEvents(flushPayload)
            }
        }))
    }

    private requeueEvents(eventsBatches: UserEventsBatchRecord[]) {
        this.requeueUserEvents(eventsBatches)
        this.requeueAggUserEventMap(eventsBatches)
    }

    /**
     * Requeue user events after failed request to DevCycle Events API.
     */
    private requeueUserEvents(eventsBatches: UserEventsBatchRecord[]) {
        for (const batch of eventsBatches) {
            for (const event of batch.events) {
                if (!AggregateEventTypes[event.type]) {
                    this.addEventToQueue(batch.user, event)
                }
            }
        }
    }

    private checkIfEventLoggingDisabled(event: DVCEvent) {
        if (!EventTypes[event.type]) {
            return this.disableCustomEventLogging
        } else {
            return this.disableAutomaticEventLogging
        }
    }
    /**
     * Queue DVCAPIEvent for publishing to DevCycle Events API.
     */
    queueEvent(user: DVCPopulatedUser, event: DVCEvent, bucketedConfig?: BucketedUserConfig): void {
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }

        this.addEventToQueue(user, new DVCRequestEvent(event, user.user_id, bucketedConfig?.featureVariationMap))
    }

    private addEventToQueue(user: DVCPopulatedUser, event: DVCRequestEvent) {
        let userEvents = this.userEventQueue[user.user_id]
        if (!userEvents) {
            userEvents = this.userEventQueue[user.user_id] = {
                user,
                events: []
            }
        } else {
            // Save updated User every time.
            userEvents.user = user
        }

        userEvents.events.push(event)

    }

    /**
     * Requeue aggregated user event map after failed request to DevCycle Events API.
     */
    private requeueAggUserEventMap(eventsBatches: UserEventsBatchRecord[]) {
        for (const batch of eventsBatches) {
            for (const event of batch.events) {
                if (AggregateEventTypes[event.type]) {
                    this.saveAggUserEvent(batch.user, event)
                }
            }
        }
    }

    /**
     * Save aggregated user event (i.e. variableEvaluated / variableDefaulted) to userEventMap.
     */
    private saveAggUserEvent(user: DVCPopulatedUser, event: DVCRequestEvent) {
        const { target } = event
        if (!target) return

        let userEventMap = this.aggregateUserEventMap[user.user_id]
        if (!userEventMap) {
            userEventMap = this.aggregateUserEventMap[user.user_id] = {
                user,
                events: {}
            }
        } else {
            // Always keep the latest user object
            userEventMap.user = user
        }

        const aggEventType = userEventMap.events[event.type]
        const aggEvent = aggEventType?.[target]
        if (!aggEventType) {
            userEventMap.events[event.type] = { [target]: event }
        } else if (aggEvent && aggEvent.value) {
            aggEvent.value += event.value || 1
        } else {
            aggEventType[target] = event
        }
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(user: DVCPopulatedUser, event: DVCEvent, bucketedConfig?: BucketedUserConfig): void {
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }
        checkParamDefined('user_id', user?.user_id)
        checkParamDefined('type', event.type)
        checkParamDefined('target', event.target)
        checkParamString('target', event.target)
        const eventCopy = { ...event }
        eventCopy.date = Date.now()
        eventCopy.value = 1

        const requestEvent = new DVCRequestEvent(eventCopy, user.user_id, bucketedConfig?.featureVariationMap)
        this.saveAggUserEvent(user, requestEvent)
    }

    /**
     * Turn the set of pending events in the queue (plain and aggregate events) into a set of
     * FlushPayloads for publishing. Each payload can only contain at most "chunkSize" events.
     * Uses an "aggregator" object to collect the pairings of events and users together. If the number of events
     * collected exceeds the chunkSize, a new aggregator will be started. Each aggregator will correspond to a
     * distinct request to the events api
     */
    private constructFlushPayloads(chunkSize: number): FlushPayload[] {
        const payloadAggregator: Record<string, UserEventsBatchRecord> = {}
        let currentUserRequestAggregator = payloadAggregator

        const flushAggregators: (typeof payloadAggregator)[] = [payloadAggregator]

        let eventCount = 0

        const addEventToCurrentAggregator = (user: DVCPopulatedUser, events: DVCRequestEvent[]) => {
            const existingUserRequestEvents = currentUserRequestAggregator[user.user_id]

            if (!existingUserRequestEvents) {
                currentUserRequestAggregator[user.user_id] = {
                    user,
                    events: []
                }
            }

            for (const event of events) {
                eventCount++

                if (eventCount > chunkSize) {
                    currentUserRequestAggregator = {
                        [user.user_id]: {
                            user,
                            events: []
                        }
                    }
                    flushAggregators.push(currentUserRequestAggregator)
                    eventCount = 1
                }

                currentUserRequestAggregator[user.user_id].events.push(event)
            }
        }

        for (const user_id in this.userEventQueue) {
            const userEventsRecord = this.userEventQueue[user_id]
            addEventToCurrentAggregator(userEventsRecord.user, userEventsRecord.events)
        }

        for (const user_id in this.aggregateUserEventMap) {
            const aggUserEventsRecord = this.aggregateUserEventMap[user_id]

            addEventToCurrentAggregator(
                aggUserEventsRecord.user,
                this.eventsFromAggregateEventMap(aggUserEventsRecord.events)
            )
        }

        return flushAggregators.map((aggregator) => Object.values(aggregator))
    }

    /**
     * Convert aggregated events map into array of individual events for publishing
     */
    private eventsFromAggregateEventMap(eventsMap: EventsMap): DVCRequestEvent[] {
        return Object.values(eventsMap).map((typeMap) => Object.values(typeMap)).flat()
    }
}
