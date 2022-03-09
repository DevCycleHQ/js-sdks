import { DVCEvent, DVCLogger, DVCUser } from '../types'
import { publishEvents } from './request'
import { checkParamDefined, checkParamString } from './utils/paramUtils'
import { DVCRequestEvent } from './models/requestEvent'
import { DVCRequestUser } from './models/requestUser'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BucketedUserConfig } from '@devcycle/types'

export const EventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

type EventsMap = Record<string, Record<string, DVCRequestEvent>>
type UserEventsMap = {
    user: DVCRequestUser,
    events: EventsMap
}
type AggregateUserEventMap = Record<string, UserEventsMap>

type UserEventsBatchRecord = {
    user: DVCRequestUser,
    events: DVCRequestEvent[]
}
export type UserEventsBatchRequestPayload = UserEventsBatchRecord[]
type UserEventQueue = Record<string, UserEventsBatchRecord>

export class EventQueue {
    private readonly logger: DVCLogger
    private readonly environmentKey: string
    private userEventQueue: UserEventQueue
    private aggregateUserEventMap: AggregateUserEventMap
    flushEventsMS: number
    private flushInterval: NodeJS.Timer

    constructor(logger: DVCLogger, environmentKey: string, flushEventsMS?: number) {
        this.logger = logger
        this.environmentKey = environmentKey
        this.userEventQueue = {}
        this.aggregateUserEventMap = {}
        this.flushEventsMS = flushEventsMS || 10 * 1000

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.flushEventsMS)
    }

    cleanup() {
        clearInterval(this.flushInterval)
    }

    /**
     * Flush events in queue to DevCycle Events API. Requeue events if flush fails
     */
    async flushEvents() {
        const userEventBatch = this.combineUserEventsToFlush()
        if (!userEventBatch.length) {
            return
        }

        const reducer = (val: number, batch: UserEventsBatchRecord) => val + batch.events.length
        const eventCount = userEventBatch.reduce(reducer, 0)
        this.logger.debug(`DVC Flush ${eventCount} Events, for ${userEventBatch.length} Users`)

        const savingUserEventQueue = this.userEventQueue
        this.userEventQueue = {}
        const savingAggregateUserEventMap = this.aggregateUserEventMap
        this.aggregateUserEventMap = {}

        try {
            const res = await publishEvents(this.logger, this.environmentKey, userEventBatch)
            if (res.status !== 201) {
                throw new Error(`Error publishing events, status: ${res.status}, body: ${res.data}`)
            } else {
                this.logger.debug(`DVC Flushed ${eventCount} Events, for ${userEventBatch.length} Users`)
            }
        } catch (ex) {
            this.logger.error(`DVC Error Flushing Events response message: ${ex.message}, ` +
                `response data: ${ex?.response?.data}`)
            this.requeueUserEvents(savingUserEventQueue)
            this.requeueAggUserEventMap(savingAggregateUserEventMap)
        }
    }

    /**
     * Requeue user events after failed request to DevCycle Events API.
     */
    private requeueUserEvents(userEventQueueToMerge: UserEventQueue) {
        for (const user_id in userEventQueueToMerge) {
            const mergeRecord = userEventQueueToMerge[user_id]
            const userRecord = this.userEventQueue[user_id]
            if (!userRecord) {
                this.userEventQueue[user_id] = { ...mergeRecord }
            } else {
                userRecord.events.push(...mergeRecord.events)
            }
        }
    }

    /**
     * Queue DVCAPIEvent for publishing to DevCycle Events API.
     */
    queueEvent(user: DVCUser, event: DVCEvent, bucketedConfig?: BucketedUserConfig) {
        let userEvents = this.userEventQueue[user.user_id]
        if (!userEvents) {
            userEvents = this.userEventQueue[user.user_id] = {
                user: new DVCRequestUser(user),
                events: []
            }
        } else {
            // Save updated User every time.
            userEvents.user = new DVCRequestUser(user)
        }

        userEvents.events.push(
            new DVCRequestEvent(event, user.user_id, bucketedConfig?.featureVariationMap)
        )
    }

    /**
     * Requeue aggregated user event map after failed request to DevCycle Events API.
     */
    private requeueAggUserEventMap(aggUserEventMapToMerge: AggregateUserEventMap) {
        for (const user_id in aggUserEventMapToMerge) {
            const mergeEventMap = aggUserEventMapToMerge[user_id]
            let userEventMap = this.aggregateUserEventMap[user_id]

            if (!userEventMap) {
                userEventMap = this.aggregateUserEventMap[user_id] = {
                    user: mergeEventMap.user,
                    events: {}
                }
            }

            const aggEvents = this.eventsFromAggregateEventMap(mergeEventMap.events)
            for (const event of aggEvents) {
                this.saveAggUserEvent(userEventMap, event)
            }
        }
    }

    /**
     * Save aggregated user event (i.e. variableEvaluated / variableDefaulted) to userEventMap.
     */
    private saveAggUserEvent(userEventMap: UserEventsMap, event: DVCRequestEvent) {
        const { target } = event
        if (!target) return

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
    queueAggregateEvent(user: DVCUser, event: DVCEvent, bucketedConfig?: BucketedUserConfig) {
        checkParamDefined('user_id', user?.user_id)
        checkParamDefined('type', event.type)
        checkParamDefined('target', event.target)
        checkParamString('target', event.target)
        const eventCopy = { ...event }
        eventCopy.date = Date.now()
        eventCopy.value = 1

        let userEventMap = this.aggregateUserEventMap[user.user_id]
        if (!userEventMap) {
            userEventMap = this.aggregateUserEventMap[user.user_id] = {
                user: new DVCRequestUser(user),
                events: {}
            }
        } else {
            // Always keep the latest user object
            userEventMap.user = new DVCRequestUser(user)
        }

        const requestEvent = new DVCRequestEvent(eventCopy, user.user_id, bucketedConfig?.featureVariationMap)
        this.saveAggUserEvent(userEventMap, requestEvent)
    }

    /**
     * Turn the Aggregate Event Map into an UserEventsBatchRequestPayload for publishing.
     */
    private combineUserEventsToFlush(): UserEventsBatchRequestPayload {
        const userRequestEventsToFlush: Record<string, UserEventsBatchRecord> = {}

        for (const user_id in this.userEventQueue) {
            const userEventsRecord = this.userEventQueue[user_id]
            const existingUserRequestEvents = userRequestEventsToFlush[user_id]

            if (existingUserRequestEvents) {
                existingUserRequestEvents.events.push(
                    ...userEventsRecord.events
                )
            } else {
                userRequestEventsToFlush[user_id] = userEventsRecord
            }
        }

        for (const user_id in this.aggregateUserEventMap) {
            const aggUserEventsRecord = this.aggregateUserEventMap[user_id]
            const existingUserRequestEvents = userRequestEventsToFlush[user_id]

            if (existingUserRequestEvents) {
                existingUserRequestEvents.events.push(
                    ...this.eventsFromAggregateEventMap(aggUserEventsRecord.events)
                )
            } else {
                userRequestEventsToFlush[user_id] = {
                    user: aggUserEventsRecord.user,
                    events: this.eventsFromAggregateEventMap(aggUserEventsRecord.events)
                }
            }
        }

        return Object.values(userRequestEventsToFlush)
    }

    /**
     * Convert aggregated events map into array of individual events for publishing
     */
    private eventsFromAggregateEventMap(eventsMap: EventsMap): DVCRequestEvent[] {
        return Object.values(eventsMap).map((typeMap) => Object.values(typeMap)).flat()
    }
}
