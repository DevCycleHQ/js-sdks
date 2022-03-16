import { DVCClient } from './Client'
import { DVCEvent } from './types'
import { publishEvents } from './Request'
import { checkParamDefined } from './utils'

export const EventTypes = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted'
}

type AggregateEvent = DVCEvent & {
    target: string
}

export class EventQueue {
    private readonly environmentKey: string
    client: DVCClient
    eventQueue: DVCEvent[]
    aggregateEventMap: Record<string, Record<string, AggregateEvent>>
    flushEventsMS: number
    flushInterval: ReturnType<typeof setInterval>

    constructor(environmentKey: string, dvcClient: DVCClient, flushEventsMS?: number) {
        this.environmentKey = environmentKey
        this.client = dvcClient
        this.eventQueue = []
        this.aggregateEventMap = {}
        this.flushEventsMS = flushEventsMS || 10 * 1000

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.flushEventsMS)
    }

    async flushEvents(): Promise<void> {
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
    queueEvent(event: DVCEvent): void {
        this.eventQueue.push(event)
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(event: AggregateEvent): void {
        checkParamDefined('type', event.type)
        checkParamDefined('target', event.target)
        event.date = Date.now()
        event.value = 1

        const aggEventType = this.aggregateEventMap[event.type]
        if (!aggEventType) {
            this.aggregateEventMap[event.type] = { [event.target]: event }
        } else if (aggEventType[event.target]) {
            aggEventType[event.target].value!++
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
