import {
    DVCEvent,
    DVCUser,
    DVCPopulatedUser,
    DVCRequestEvent,
    FlushPayload,
    UserEventsBatchRecord, EventQueueOptions
} from '../types'
import { jsonObjFromMap } from '../helpers/jsonHelpers'
import { JSON } from 'assemblyscript-json/assembly'
import { _getPlatformData } from '../managers/platformDataManager'

/**
 * This RequestPayloadManager Class handles all the logic for creating event flushing payloads,
 * and handling the onSuccess and onFailure logic for those payloads.
 */
export class RequestPayloadManager {
    private pendingPayloads: Map<string, FlushPayload>
    private readonly chunkSize: i32

    constructor(options: EventQueueOptions) {
        this.pendingPayloads = new Map<string, FlushPayload>()
        this.chunkSize = options.chunkSize
    }

    constructFlushPayloads(
        userEventQueue: Map<string, UserEventsBatchRecord>,
        aggEventQueue: Map<string, Map<string, Map<string, i64>>>
    ): FlushPayload[] {
        this.checkForFailedPayloads()

        // Add events from user event queue
        const userEventQueueKeys = userEventQueue.keys()
        for (let i = 0; i < userEventQueueKeys.length; i++) {
            const key = userEventQueueKeys[i]
            const userEventsRecord = userEventQueue.get(key)
            this.addEventsToPendingPayloads(userEventsRecord)
        }

        // Add events from aggregate events
        this.addAggEventsToPendingPayloads(aggEventQueue)

        return this.pendingPayloads.values()
    }

    /**
     * generate aggregated events by resolving aggregated event map into DVCEvent's.
     */
    private addAggEventsToPendingPayloads(
        aggEventQueue: Map<string, Map<string, Map<string, i64>>>
    ): void {
        const aggEventQueueKeys = aggEventQueue.keys()
        const aggEvents: DVCRequestEvent[] = []

        const platformData = _getPlatformData()
        const user_id = platformData.hostname ? platformData.hostname as string : 'aggregate'

        for (let i = 0; i < aggEventQueueKeys.length; i++) {
            const type = aggEventQueueKeys[i]
            const typeAggMap: Map<string, Map<string, i64>> = aggEventQueue.get(type)
            const typeAggMapKeys = typeAggMap.keys()

            for (let y = 0; y < typeAggMapKeys.length; y++) {
                const target = typeAggMapKeys[y]
                const targetAggMap: Map<string, i64> = typeAggMap.get(target)
                let value: f64 = NaN
                let metaData: JSON.Obj | null = null
                if (targetAggMap.has('value')) {
                    value = f64(targetAggMap.get('value'))
                } else {
                    metaData = jsonObjFromMap(targetAggMap)
                }

                const dvcEvent = new DVCEvent(
                    type,
                    target,
                    null,
                    value,
                    metaData
                )
                aggEvents.push(new DVCRequestEvent(dvcEvent, user_id, null))
            }
        }

        // Generate defaulted agreagate user as our events APIs require a user / user_id
        const dvcUser = new DVCPopulatedUser(new DVCUser(
            user_id, null, null, null, null, NaN, null, null, null, null
        ))
        this.addEventsToPendingPayloads(new UserEventsBatchRecord(dvcUser, aggEvents))
    }

    /**
     * Chunk up UserEventsBatchRecord's into payloads of size: this.chunkSize
     */
    private addEventsToPendingPayloads(record: UserEventsBatchRecord): void {
        let flushPayload = new FlushPayload([])

        while (record.events.length > this.chunkSize) {
            const batchRecord = new UserEventsBatchRecord(
                record.user,
                record.events.splice(0, this.chunkSize)
            )
            flushPayload.records.push(batchRecord)
            this.pendingPayloads.set(flushPayload.payloadId, flushPayload)
            flushPayload = new FlushPayload([])
        }
        if (record.events.length > 0) {
            flushPayload.records.push(record)
        }
        if (flushPayload.records.length > 0) {
            this.pendingPayloads.set(flushPayload.payloadId, flushPayload)
        }
    }

    /**
     * Mark pending payload as success, remove from pending payloads array.
     */
    markPayloadSuccess(payloadId: string): void {
        if (!this.pendingPayloads.has(payloadId)) {
            throw new Error(`Could not find payloadId: ${payloadId} to mark as success`)
        }

        this.pendingPayloads.delete(payloadId)
    }

    markPayloadFailure(payloadId: string, retryable: boolean): void {
        if (!this.pendingPayloads.has(payloadId)) {
            throw new Error(
                `Could not find payload: ${payloadId}, retryable: ${retryable} to mark as failure`
            )
        }

        if (retryable) {
            const payload = this.pendingPayloads.get(payloadId)
            payload.status = 'failed'
        } else {
            this.pendingPayloads.delete(payloadId)
        }
    }

    /**
     * Check that the pendingPayloads queue is empty or only contains retryable failed payloads
     * before creating new batch of payloads.
     */
    checkForFailedPayloads(): void {
        this.pendingPayloads.values().forEach((payload) => {
            if (payload.status === 'failed') {
                payload.status = 'sending'
            } else {
                throw new Error(`Request Payload: ${payload.payloadId} has not finished sending`)
            }
        })
    }
}
