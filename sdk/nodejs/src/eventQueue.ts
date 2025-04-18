import { DVCRequestEvent } from './models/requestEvent'
import {
    BucketedUserConfig,
    DVCLogger,
    DVCReporter,
    FlushResults,
} from '@devcycle/types'
import { publishEvents } from './request'
import { DevCycleEvent, DVCPopulatedUser } from '@devcycle/js-cloud-server-sdk'
import { WASMBucketingExports } from '@devcycle/bucketing-assembly-script'

export const AggregateEventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    aggVariableEvaluated: 'aggVariableEvaluated',
    variableDefaulted: 'variableDefaulted',
    aggVariableDefaulted: 'aggVariableDefaulted',
}

export const EventTypes: Record<string, string> = {
    ...AggregateEventTypes,
}

type UserEventsBatchRecord = {
    user: DVCPopulatedUser
    events: DVCRequestEvent[]
}
export type FlushPayload = {
    payloadId: string
    eventCount: number
    records: UserEventsBatchRecord[]
}

export type EventQueueOptions = {
    eventFlushIntervalMS?: number
    disableAutomaticEventLogging?: boolean
    disableCustomEventLogging?: boolean
    eventRequestChunkSize?: number
    maxEventQueueSize?: number
    flushEventQueueSize?: number
    logger: DVCLogger
    reporter?: DVCReporter
    eventsAPIURI?: string
}

export class EventQueue {
    private readonly logger: DVCLogger
    private readonly reporter?: DVCReporter
    private readonly eventsAPIURI?: string
    eventFlushIntervalMS: number
    flushEventQueueSize: number
    maxEventQueueSize: number
    disabledEventFlush: boolean
    private flushInterval: NodeJS.Timeout
    private flushInProgress = false
    private flushCallbacks: Array<(arg: unknown) => void> = []

    constructor(
        private readonly sdkKey: string,
        private readonly clientUUID: string,
        private readonly bucketing: WASMBucketingExports,
        options: EventQueueOptions,
    ) {
        this.logger = options.logger
        this.reporter = options.reporter
        this.eventsAPIURI = options.eventsAPIURI
        this.eventFlushIntervalMS = options?.eventFlushIntervalMS || 10 * 1000
        this.disabledEventFlush = false

        if (this.eventFlushIntervalMS < 500) {
            throw new Error(
                `eventFlushIntervalMS: ${this.eventFlushIntervalMS} must be larger than 500ms`,
            )
        } else if (this.eventFlushIntervalMS > 60 * 1000) {
            throw new Error(
                `eventFlushIntervalMS: ${this.eventFlushIntervalMS} must be smaller than 1 minute`,
            )
        }

        this.flushEventQueueSize = options?.flushEventQueueSize || 1000
        this.maxEventQueueSize = options?.maxEventQueueSize || 2000
        const chunkSize = options?.eventRequestChunkSize || 100
        if (this.flushEventQueueSize >= this.maxEventQueueSize) {
            throw new Error(
                `flushEventQueueSize: ${this.flushEventQueueSize} must be smaller than ` +
                    `maxEventQueueSize: ${this.maxEventQueueSize}`,
            )
        } else if (
            this.flushEventQueueSize < chunkSize ||
            this.maxEventQueueSize < chunkSize
        ) {
            throw new Error(
                `flushEventQueueSize: ${this.flushEventQueueSize} and ` +
                    `maxEventQueueSize: ${this.maxEventQueueSize} ` +
                    `must be smaller than eventRequestChunkSize: ${chunkSize}`,
            )
        } else if (
            this.flushEventQueueSize > 20000 ||
            this.maxEventQueueSize > 20000
        ) {
            throw new Error(
                `flushEventQueueSize: ${this.flushEventQueueSize} or ` +
                    `maxEventQueueSize: ${this.maxEventQueueSize} ` +
                    'must be smaller than 20,000',
            )
        }

        this.flushInterval = setInterval(
            this.flushEvents.bind(this),
            this.eventFlushIntervalMS,
        )

        const eventQueueOptions = {
            eventRequestChunkSize: chunkSize,
            disableAutomaticEventLogging: options.disableAutomaticEventLogging,
            disableCustomEventLogging: options.disableCustomEventLogging,
        }

        this.bucketing.initEventQueue(
            sdkKey,
            this.clientUUID,
            JSON.stringify(eventQueueOptions),
        )
    }

    cleanup(): void {
        clearInterval(this.flushInterval)
        this.disabledEventFlush = true
    }

    private async _flushEvents() {
        const metricTags = {
            envKey: this.sdkKey,
            sdkKey: this.sdkKey,
        }
        this.reporter?.reportMetric(
            'queueLength',
            this.bucketing.eventQueueSize(this.sdkKey),
            metricTags,
        )

        let flushPayloadsStr
        try {
            flushPayloadsStr = this.bucketing.flushEventQueue(this.sdkKey)
            this.reporter?.reportMetric(
                'flushPayloadSize',
                flushPayloadsStr?.length,
                metricTags,
            )
        } catch (ex) {
            this.logger.error(`DevCycle Error Flushing Events: ${ex.message}`)
        }

        const results: FlushResults = {
            failures: 0,
            retries: 0,
            successes: 0,
        }

        if (!flushPayloadsStr) return
        this.logger.debug(`Flush Payloads: ${flushPayloadsStr}`)
        const startTimeJson = Date.now()
        const flushPayloads = JSON.parse(flushPayloadsStr) as FlushPayload[]
        const endTimeJson = Date.now()
        this.reporter?.reportMetric(
            'jsonParseDuration',
            endTimeJson - startTimeJson,
            metricTags,
        )
        if (flushPayloads.length === 0) {
            return
        }

        const reducer = (val: number, batches: FlushPayload) =>
            val + batches.eventCount
        const eventCount = flushPayloads.reduce(reducer, 0)
        this.logger.debug(
            `DevCycle Flush ${eventCount} Events, for ${flushPayloads.length} Users`,
        )

        const startTimeRequests = Date.now()

        await Promise.all(
            flushPayloads.map(async (flushPayload) => {
                try {
                    const res = await publishEvents(
                        this.logger,
                        this.sdkKey,
                        flushPayload.records,
                        this.eventsAPIURI,
                    )
                    if (res.status !== 201) {
                        this.logger.debug(
                            `Error publishing events, status: ${
                                res.status
                            }, body: ${await res.text()}`,
                        )
                        if (res.status >= 500) {
                            results.retries++
                            this.bucketing.onPayloadFailure(
                                this.sdkKey,
                                flushPayload.payloadId,
                                true,
                            )
                        } else {
                            results.failures++
                            this.bucketing.onPayloadFailure(
                                this.sdkKey,
                                flushPayload.payloadId,
                                false,
                            )
                        }
                    } else {
                        this.logger.debug(
                            `DevCycle Flushed ${eventCount} Events, for ${flushPayload.records.length} Users`,
                        )
                        this.bucketing.onPayloadSuccess(
                            this.sdkKey,
                            flushPayload.payloadId,
                        )
                        results.successes++
                    }
                } catch (ex) {
                    this.logger.debug(
                        `DevCycle Error Flushing Events response message: ${ex.message}`,
                    )
                    if ('status' in ex && ex.status === 401) {
                        this.logger.debug(
                            `SDK key is invalid, closing event flushing interval`,
                        )
                        this.bucketing.onPayloadFailure(
                            this.sdkKey,
                            flushPayload.payloadId,
                            false,
                        )
                        results.failures++
                        this.cleanup()
                    } else {
                        this.bucketing.onPayloadFailure(
                            this.sdkKey,
                            flushPayload.payloadId,
                            true,
                        )
                        results.retries++
                    }
                }
            }),
        )

        const endTimeRequests = Date.now()

        this.reporter?.reportMetric(
            'flushRequestDuration',
            endTimeRequests - startTimeRequests,
            metricTags,
        )
        if (results) {
            this.reporter?.reportFlushResults(results, metricTags)
        }
    }

    /**
     * Flush events in queue to DevCycle Events API. Requeue events if flush fails
     */
    async flushEvents(): Promise<void> {
        if (this.flushInProgress) {
            await new Promise((resolve) => {
                this.flushCallbacks.push(resolve)
            })
            return
        }
        this.flushInProgress = true

        const currentFlushCallbacks = this.flushCallbacks.splice(
            0,
            this.flushCallbacks.length,
        )

        try {
            await this._flushEvents()
        } catch (e) {
            this.logger.error(`DVC Error Flushing Events`, e)
        }

        this.flushInProgress = false

        currentFlushCallbacks.forEach((cb) => cb(null))
        if (this.flushCallbacks.length > 0) {
            this.flushEvents()
        }
    }

    /**
     * Queue DVCAPIEvent for publishing to DevCycle Events API.
     */
    queueEvent(user: DVCPopulatedUser, event: DevCycleEvent): void {
        if (this.disabledEventFlush) {
            this.logger.warn(
                `Event flushing is disabled, dropping event: ${
                    event.type
                }, event queue size: ${this.bucketing.eventQueueSize(
                    this.sdkKey,
                )}`,
            )
            return
        }
        if (this.checkEventQueueSize()) {
            this.logger.warn(
                `Max event queue size reached, dropping event: ${event.type}`,
            )
            return
        }

        this.bucketing.queueEvent(
            this.sdkKey,
            JSON.stringify(user),
            JSON.stringify(event),
        )
    }

    /**
     * Queue DVCEvent that can be aggregated together, where multiple calls are aggregated
     * by incrementing the 'value' field.
     */
    queueAggregateEvent(
        user: DVCPopulatedUser,
        event: DevCycleEvent,
        bucketedConfig?: BucketedUserConfig,
    ): void {
        if (this.disabledEventFlush) {
            this.logger.warn(
                `Event flushing is disabled, dropping aggregate event: ${event.type}`,
            )
            return
        }
        if (this.checkEventQueueSize()) {
            this.logger.warn(
                `Max event queue size reached, dropping aggregate event: ${event.type}`,
            )
            return
        }

        this.bucketing.queueAggregateEvent(
            this.sdkKey,
            JSON.stringify(event),
            JSON.stringify(bucketedConfig?.variableVariationMap || {}),
        )
    }

    private checkEventQueueSize(): boolean {
        const queueSize = this.bucketing.eventQueueSize(this.sdkKey)
        if (queueSize >= this.flushEventQueueSize) {
            this.flushEvents()
            if (queueSize >= this.maxEventQueueSize) {
                return true
            }
        }
        return false
    }
}
