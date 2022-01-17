import { DVCClient } from './Client'
import { DVCEvent } from 'dvc-js-client-sdk'
import { publishEvents } from './Request'
import { checkParamDefined } from './utils'
import { DVCRequestEvent } from './RequestEvent'

export const EventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

export class EventQueue {
    private readonly environmentKey: string
    client: DVCClient
    eventQueue: DVCEvent[]
    aggregateEventMap: Record<string, Record<string, DVCEvent>>
    flushEventsMS: number
    flushInterval: NodeJS.Timer

    constructor(environmentKey: string, dvcClient: DVCClient, flushEventsMS?: number) {
        this.environmentKey = environmentKey
        this.client = dvcClient
        this.eventQueue = []
        this.aggregateEventMap = {}
        this.flushEventsMS = flushEventsMS || 10 * 1000

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.flushEventsMS)
    }

    async flushEvents() {
        if (!this.client.config) {
            console.log('DVC Client not initialized to flush events!')
            return
        }

        const eventsToFlush = [ ...this.eventQueue ]
        const aggregateEventsToFlush = this.eventsFromAggregateEventMap()
        eventsToFlush.push(...aggregateEventsToFlush)

        if (!eventsToFlush.length) {
            return
        }

        console.log(`DVC Flush ${eventsToFlush.length} Events`)

        this.eventQueue = []
        this.aggregateEventMap = {}

        try {
            const res = await publishEvents(
                this.environmentKey,
                this.client.config,
                this.client.user,
                eventsToFlush
            )
            if (res.status !== 201) {
                this.eventQueue.push(...eventsToFlush)
            } else {
                console.log(`DVC Flushed ${eventsToFlush.length} Events.`)
            }
        } catch (ex) {
            this.client.eventEmitter.emitError(ex)
            this.eventQueue.push(...eventsToFlush)
        }
    }

    /**
     * Queue DVCAPIEvent for producing
     */
    queueEvent(event: DVCEvent) {
        this.eventQueue.push(event)
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(event: DVCEvent) {
        checkParamDefined('type', event.type)
        checkParamDefined('target', event.target)
        event.date = Date.now()
        event.value = 1

        const aggEventType = this.aggregateEventMap[event.type]
        if (!aggEventType) {
            this.aggregateEventMap[event.type] = { [event.target]: event }
        } else if (aggEventType[event.target]) {
            aggEventType[event.target].value++
        } else {
            aggEventType[event.target] = event
        }
    }

    /**
     * Turn the Aggregate Event Map into an Array of DVCAPIEvent objects for publishing.
     */
    private eventsFromAggregateEventMap(): DVCEvent[] {
        return Object.values(this.aggregateEventMap).map((typeMap) => Object.values(typeMap)).flat()
    }
}
