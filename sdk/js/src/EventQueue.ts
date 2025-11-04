import { DevCycleClient } from './Client'
import { DevCycleEvent, DevCycleOptions, DVCCustomDataJSON } from './types'
import { publishEvents } from './Request'
import { checkParamDefined } from './utils'
import chunk from 'lodash/chunk'
import { VariableDefinitions } from '@devcycle/types'

export const EventTypes = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

type AggregateEvent = DevCycleEvent & {
    target: string
}

export class EventQueue<
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
> {
    private readonly sdkKey: string
    private readonly options: DevCycleOptions
    private readonly client: DevCycleClient<Variables, CustomData>
    private eventQueue: DevCycleEvent[]
    private aggregateEventMap: Record<string, Record<string, AggregateEvent>>
    private flushInterval: ReturnType<typeof setInterval>
    private flushEventQueueSize: number
    private maxEventQueueSize: number
    private eventQueueBatchSize = 100

    constructor(
        sdkKey: string,
        dvcClient: DevCycleClient<Variables, CustomData>,
        options: DevCycleOptions,
    ) {
        this.sdkKey = sdkKey
        this.client = dvcClient
        this.eventQueue = []
        this.aggregateEventMap = {}
        this.options = options

        const eventFlushIntervalMS =
            typeof options.eventFlushIntervalMS === 'number'
                ? options.eventFlushIntervalMS
                : 10 * 1000
        if (eventFlushIntervalMS < 500) {
            throw new Error(
                `eventFlushIntervalMS: ${eventFlushIntervalMS} must be larger than 500ms`,
            )
        } else if (eventFlushIntervalMS > 60 * 1000) {
            throw new Error(
                `eventFlushIntervalMS: ${eventFlushIntervalMS} must be smaller than 1 minute`,
            )
        }

        if (!options.next?.disableAutomaticEventFlush) {
            this.flushInterval = setInterval(
                this.flushEvents.bind(this),
                eventFlushIntervalMS,
            )
        }

        this.flushEventQueueSize = options?.flushEventQueueSize ?? 100
        this.maxEventQueueSize = options?.maxEventQueueSize ?? 1000
        if (this.flushEventQueueSize >= this.maxEventQueueSize) {
            throw new Error(
                `flushEventQueueSize: ${this.flushEventQueueSize} must be smaller than ` +
                    `maxEventQueueSize: ${this.maxEventQueueSize}`,
            )
        } else if (
            this.flushEventQueueSize < 10 ||
            this.flushEventQueueSize > 1000
        ) {
            throw new Error(
                `flushEventQueueSize: ${this.flushEventQueueSize} must be between 10 and 1000`,
            )
        } else if (
            this.maxEventQueueSize < 100 ||
            this.maxEventQueueSize > 5000
        ) {
            throw new Error(
                `maxEventQueueSize: ${this.maxEventQueueSize} must be between 100 and 5000`,
            )
        }
    }

    async flushEvents(): Promise<void> {
        const user = this.client.user

        if (!user) {
            this.client.logger.warn(
                'Skipping event flush, user has not been set yet.',
            )
            return
        }

        const eventsToFlush = [...this.eventQueue]
        const aggregateEventsToFlush = this.eventsFromAggregateEventMap()
        console.log(
            `internal flushing ${this.eventQueue.length} events, ${aggregateEventsToFlush.length} aggEvents`,
        )
        eventsToFlush.push(...aggregateEventsToFlush)

        if (!eventsToFlush.length) {
            return
        }

        this.client.logger.info(`Flush ${eventsToFlush.length} Events`)

        this.eventQueue = []
        this.aggregateEventMap = {}

        const eventRequests = chunk(eventsToFlush, this.eventQueueBatchSize)
        for (const eventRequest of eventRequests) {
            try {
                const res = await publishEvents(
                    this.sdkKey,
                    this.client.config,
                    user,
                    eventRequest,
                    this.client.logger,
                    this.options,
                )
                if (res.status === 201) {
                    this.client.logger.info(
                        `DevCycle Flushed ${eventRequest.length} Events.`,
                    )
                } else if (res.status >= 500 || res.status === 408) {
                    this.client.logger.warn(
                        'failed to flush events, retrying events. ' +
                            `Response status: ${res.status}, message: ${res.statusText}`,
                    )
                    this.eventQueue.push(...eventRequest)
                } else {
                    this.client.logger.error(
                        'failed to flush events, dropping events. ' +
                            `Response status: ${res.status}, message: ${res.statusText}`,
                    )
                }
            } catch (ex: any) {
                this.client.eventEmitter.emitError(ex)
                this.client.logger.error(
                    'failed to flush events due to error, dropping events. ' +
                        `Error message: ${ex?.message}`,
                )
            }
        }
    }

    /**
     * Queue DVCAPIEvent for producing
     */
    queueEvent(event: DevCycleEvent): void {
        if (this.checkEventQueueSize()) {
            this.client.logger.warn(
                `DevCycle: Max event queue size (${this.maxEventQueueSize}) reached, dropping event: ${event}`,
            )
            return
        }
        console.log('queued event')
        this.eventQueue.push(event)
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(event: AggregateEvent): void {
        if (this.checkEventQueueSize()) {
            this.client.logger.warn(
                `DevCycle: Max event queue size (${this.maxEventQueueSize}) reached, dropping event: ${event}`,
            )
            return
        }

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

    private checkEventQueueSize(): boolean {
        const aggCount = Object.values(this.aggregateEventMap).reduce(
            (acc, v) => acc + Object.keys(v).length,
            0,
        )
        const queueSize = this.eventQueue.length + aggCount
        if (queueSize >= this.flushEventQueueSize) {
            this.flushEvents()
        }
        return queueSize >= this.maxEventQueueSize
    }

    /**
     * Turn the Aggregate Event Map into an Array of DVCAPIEvent objects for publishing.
     */
    private eventsFromAggregateEventMap(): DevCycleEvent[] {
        return Object.values(this.aggregateEventMap)
            .map((typeMap) => Object.values(typeMap))
            .flat()
    }

    async close(): Promise<void> {
        console.log('close')
        clearInterval(this.flushInterval)
        await this.flushEvents()
    }
}
