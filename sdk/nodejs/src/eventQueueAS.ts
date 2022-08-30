import { DVCEvent } from './types'
import { DVCRequestEvent } from './models/requestEvent'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCLogger } from '@devcycle/types'

import { getBucketingLib } from './bucketing'
import { EventQueueInterface } from './eventQueue'

export const AggregateEventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

export const EventTypes: Record<string, string> = { ...AggregateEventTypes }

type UserEventsBatchRecord = {
    user: DVCPopulatedUser,
    events: DVCRequestEvent[]
}
export type FlushPayload = {
    payloadId: string,
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
        const flushPayloadsStr = getBucketingLib().flushEventQueue(this.environmentKey)
        this.logger.debug(`AS Flush Payloads: ${flushPayloadsStr}`)
        const flushPayloads = JSON.parse(flushPayloadsStr) as FlushPayload[]

        // TODO: send requests

        for (const payload of flushPayloads) {
            getBucketingLib().onPayloadSuccess(this.environmentKey, payload.payloadId)
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
    queueAggregateEvent(user: DVCPopulatedUser, event: DVCEvent): void {
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }

        getBucketingLib().queueAggregateEvent(
            this.environmentKey,
            JSON.stringify(user),
            JSON.stringify(event)
        )
    }
}
