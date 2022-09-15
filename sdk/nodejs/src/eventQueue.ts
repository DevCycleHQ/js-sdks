import { DVCEvent } from './types'
import { DVCRequestEvent } from './models/requestEvent'
import { DVCPopulatedUser } from './models/populatedUser'
import { BucketedUserConfig, DVCLogger, DVCReporter, FlushResults } from '@devcycle/types'

import { getBucketingLib } from './bucketing'
import { publishEvents } from './request'

export const AggregateEventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    aggVariableEvaluated: 'aggVariableEvaluated',
    variableDefaulted: 'variableDefaulted',
    aggVariableDefaulted: 'aggVariableDefaulted'
}

export const EventTypes: Record<string, string> = {
    ...AggregateEventTypes
}

type UserEventsBatchRecord = {
    user: DVCPopulatedUser,
    events: DVCRequestEvent[]
}
export type FlushPayload = {
    payloadId: string,
    eventCount: number,
    records: UserEventsBatchRecord[]
}

export type EventQueueOptions = {
    eventFlushIntervalMS?: number,
    disableAutomaticEventLogging?: boolean,
    disableCustomEventLogging?: boolean,
    eventRequestChunkSize?: number,
    maxEventQueueSize?: number,
    flushEventQueueSize?: number,
    logger: DVCLogger,
    reporter?: DVCReporter,
    eventsAPIURI?: string
}

export class EventQueue {
    private readonly logger: DVCLogger
    private readonly reporter?: DVCReporter
    private readonly environmentKey: string
    private readonly eventsAPIURI?: string
    eventFlushIntervalMS: number
    flushEventQueueSize: number
    maxEventQueueSize: number
    private flushInterval: NodeJS.Timer
    private flushInProgress = false

    constructor(environmentKey: string, options: EventQueueOptions) {
        this.logger = options.logger
        this.reporter = options.reporter
        this.eventsAPIURI = options.eventsAPIURI
        this.environmentKey = environmentKey
        this.eventFlushIntervalMS = options?.eventFlushIntervalMS || 10 * 1000
        if (this.eventFlushIntervalMS < 500) {
            throw new Error(`eventFlushIntervalMS: ${this.eventFlushIntervalMS} must be larger than 500ms`)
        } else if (this.eventFlushIntervalMS > (60 * 1000)) {
            throw new Error(`eventFlushIntervalMS: ${this.eventFlushIntervalMS} must be smaller than 1 minute`)
        }

        this.flushEventQueueSize = options?.flushEventQueueSize || 1000
        this.maxEventQueueSize = options?.maxEventQueueSize || 2000
        const chunkSize = options?.eventRequestChunkSize || 100
        if (this.flushEventQueueSize >= this.maxEventQueueSize) {
            throw new Error(`flushEventQueueSize: ${this.flushEventQueueSize} must be larger than ` +
                `maxEventQueueSize: ${this.maxEventQueueSize}`)
        } else if (this.flushEventQueueSize < chunkSize || this.maxEventQueueSize < chunkSize) {
            throw new Error(`flushEventQueueSize: ${this.flushEventQueueSize} and ` +
                `maxEventQueueSize: ${this.maxEventQueueSize} ` +
                `must be smaller than eventRequestChunkSize: ${chunkSize}`)
        } else if (this.flushEventQueueSize > 20000 || this.maxEventQueueSize > 20000) {
            throw new Error(`flushEventQueueSize: ${this.flushEventQueueSize} or ` +
                `maxEventQueueSize: ${this.maxEventQueueSize} ` +
                'must be smaller than 20,000')
        }

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.eventFlushIntervalMS)

        getBucketingLib().initEventQueue(environmentKey, JSON.stringify(options))
    }

    cleanup(): void {
        clearInterval(this.flushInterval)
    }

    /**
     * Flush events in queue to DevCycle Events API. Requeue events if flush fails
     */
    async flushEvents(): Promise<void> {
        const metricTags = {
            envKey: this.environmentKey
        }
        this.reporter?.reportMetric('queueLength', getBucketingLib().eventQueueSize(this.environmentKey), metricTags)

        let flushPayloadsStr
        try {
            flushPayloadsStr = getBucketingLib().flushEventQueue(this.environmentKey)
            this.reporter?.reportMetric('flushPayloadSize', flushPayloadsStr?.length, metricTags)
        } catch (ex) {
            this.logger.error(`DVC Error Flushing Events: ${ex.message}`)
        }

        const results: FlushResults = {
            failures: 0,
            retries: 0,
            successes: 0
        }

        if (!flushPayloadsStr) return
        this.logger.debug(`Flush Payloads: ${flushPayloadsStr}`)
        const startTimeJson = Date.now()
        const flushPayloads = JSON.parse(flushPayloadsStr) as FlushPayload[]
        const endTimeJson = Date.now()
        this.reporter?.reportMetric('jsonParseDuration', endTimeJson - startTimeJson, metricTags)
        if (flushPayloads.length === 0) return

        const reducer = (val: number, batches: FlushPayload) => val + batches.eventCount
        const eventCount = flushPayloads.reduce(reducer, 0)
        this.logger.debug(`DVC Flush ${eventCount} Events, for ${flushPayloads.length} Users`)
        this.flushInProgress = true

        const startTimeRequests = Date.now()
        await Promise.all(flushPayloads.map(async (flushPayload) => {
            try {
                const res = await publishEvents(
                    this.logger,
                    this.environmentKey,
                    flushPayload.records,
                    this.eventsAPIURI
                )
                if (res.status !== 201) {
                    this.logger.error(`Error publishing events, status: ${res.status}, body: ${await res.text()}`)
                    if (res.status >= 500) {
                        results.retries++
                        getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, true)
                    } else {
                        results.failures++
                        getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, false)
                    }
                } else {
                    this.logger.debug(`DVC Flushed ${eventCount} Events, for ${flushPayload.records.length} Users`)
                    getBucketingLib().onPayloadSuccess(this.environmentKey, flushPayload.payloadId)
                    results.successes++
                }
            } catch (ex) {
                this.logger.error(`DVC Error Flushing Events response message: ${ex.message}`)
                getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, true)
                results.retries++
            }
        }))
        this.flushInProgress = false
        const endTimeRequests = Date.now()

        this.reporter?.reportMetric('flushRequestDuration', endTimeRequests - startTimeRequests, metricTags)
        this.reporter?.reportFlushResults(results, metricTags)
    }

    /**
     * Queue DVCAPIEvent for publishing to DevCycle Events API.
     */
    queueEvent(user: DVCPopulatedUser, event: DVCEvent): void {
        if (this.checkEventQueueSize()) {
            this.logger.warn(`Max event queue size reached, dropping event: ${event}`)
            return
        }

        getBucketingLib().queueEvent(
            this.environmentKey,
            JSON.stringify(user),
            JSON.stringify(event)
        )
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(user: DVCPopulatedUser, event: DVCEvent, bucketedConfig?: BucketedUserConfig): void {
        if (this.checkEventQueueSize()) {
            this.logger.warn(`Max event queue size reached, dropping aggregate event: ${event}`)
            return
        }

        getBucketingLib().queueAggregateEvent(
            this.environmentKey,
            JSON.stringify(event),
            JSON.stringify(bucketedConfig?.variableVariationMap || {})
        )
    }

    private checkEventQueueSize(): boolean {
        const queueSize = getBucketingLib().eventQueueSize(this.environmentKey)
        if (queueSize >= this.flushEventQueueSize) {
            if (!this.flushInProgress) {
                this.flushEvents()
            }

            if (queueSize >= this.maxEventQueueSize) {
                return true
            }
        }
        return false
    }
}
