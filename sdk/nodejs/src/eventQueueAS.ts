import { DVCEvent } from './types'
import { DVCRequestEvent } from './models/requestEvent'
import { DVCPopulatedUser } from './models/populatedUser'
import {BucketedUserConfig, DVCLogger} from '@devcycle/types'

import { getBucketingLib } from './bucketing'
import { EventQueueInterface, EventTypes } from './eventQueue'
import { publishEvents } from './request'

type UserEventsBatchRecord = {
    user: DVCPopulatedUser,
    events: DVCRequestEvent[]
}
export type FlushPayload = {
    payloadId: string,
    eventCount: number,
    records: UserEventsBatchRecord[]
}

type options = {
    flushEventsMS?: number,
    disableAutomaticEventLogging?: boolean,
    disableCustomEventLogging?: boolean
}

export class EventQueueAS implements EventQueueInterface {
    private readonly logger: DVCLogger
    private readonly environmentKey: string
    flushEventsMS: number
    disableAutomaticEventLogging: boolean
    disableCustomEventLogging: boolean
    private flushInterval: NodeJS.Timer

    constructor(logger: DVCLogger, environmentKey: string, options?: options) {
        this.logger = logger
        this.environmentKey = environmentKey
        this.flushEventsMS = options?.flushEventsMS || 10 * 1000
        this.disableAutomaticEventLogging = options?.disableAutomaticEventLogging || false
        this.disableCustomEventLogging = options?.disableCustomEventLogging || false

        this.flushInterval = setInterval(this.flushEvents.bind(this), this.flushEventsMS)

        getBucketingLib().initEventQueue(environmentKey, JSON.stringify(options))
    }

    cleanup(): void {
        clearInterval(this.flushInterval)
    }

    /**
     * Flush events in queue to DevCycle Events API. Requeue events if flush fails
     */
    async flushEvents(): Promise<void> {
        let flushPayloadsStr
        try {
            flushPayloadsStr = getBucketingLib().flushEventQueue(this.environmentKey)
        } catch (ex) {
            this.logger.error(`DVC Error Flushing Events: ${ex.message}`)
        }

        if (!flushPayloadsStr) return
        this.logger.debug(`AS Flush Payloads: ${flushPayloadsStr}`)
        const flushPayloads = JSON.parse(flushPayloadsStr) as FlushPayload[]
        if (flushPayloads.length === 0) return

        const reducer = (val: number, batches: FlushPayload) => val + batches.eventCount
        const eventCount = flushPayloads.reduce(reducer, 0)
        this.logger.debug(`DVC Flush ${eventCount} AS Events, for ${flushPayloads.length} Users`)

        await Promise.all(flushPayloads.map(async (flushPayload) => {
            try {
                const res = await publishEvents(this.logger, this.environmentKey, flushPayload.records)
                if (res.status !== 201) {
                    this.logger.error(`Error publishing events, status: ${res.status}, body: ${res.data}`)
                    if (res.status >= 500) {
                        getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, true)
                    } else {
                        getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, false)
                    }
                } else {
                    this.logger.debug(`DVC Flushed ${eventCount} Events, for ${flushPayload.records.length} Users`)
                    getBucketingLib().onPayloadSuccess(this.environmentKey, flushPayload.payloadId)
                }
            } catch (ex) {
                this.logger.error(`DVC Error Flushing Events response message: ${ex.message}`)
                getBucketingLib().onPayloadFailure(this.environmentKey, flushPayload.payloadId, false)
            }
        }))
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
    queueEvent(user: DVCPopulatedUser, event: DVCEvent): void {
        if (this.checkIfEventLoggingDisabled(event)) {
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
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }

        getBucketingLib().queueAggregateEvent(
            this.environmentKey,
            JSON.stringify(event),
            JSON.stringify(bucketedConfig?.variableVariationMap || {})
        )
    }
}
