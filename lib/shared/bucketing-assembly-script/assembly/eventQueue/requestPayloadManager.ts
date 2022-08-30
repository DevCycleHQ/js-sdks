import {
    DVCEvent,
    DVCUser,
    DVCPopulatedUser,
    DVCRequestEvent,
    FlushPayload,
    UserEventsBatchRecord
} from '../types'
import { jsonObjFromMap } from '../helpers/jsonHelpers'
import { JSON } from 'assemblyscript-json/assembly'

/**
 * This RequestPayloadManager Class handles all the logic for creating event flushing payloads,
 * and handling the onSuccess and onFailure logic for those payloads.
 */
export class RequestPayloadManager {
    private pendingPayloads: FlushPayload[] = []

    constructFlushPayloads(
        userEventQueue: Map<string, UserEventsBatchRecord>,
        aggEventQueue: Map<string, Map<string, Map<string, i64>>>,
        chunkSize: i32 = 100
    ): FlushPayload[] {
        this.pendingPayloads = []

        const userEventQueueKeys = userEventQueue.keys()
        for (let i = 0; i < userEventQueueKeys.length; i++) {
            const key = userEventQueueKeys[i]
            const userEventsRecord = userEventQueue.get(key)
            this.addEventsToPendingPayloads(userEventsRecord, chunkSize)
        }

        this.addAggEventsToPendingPayloads(aggEventQueue, chunkSize)

        return this.pendingPayloads
    }

    private addAggEventsToPendingPayloads(
        aggEventQueue: Map<string, Map<string, Map<string, i64>>>,
        chunkSize: i32
    ): void {
        const aggEventQueueKeys = aggEventQueue.keys()
        const aggEvents: DVCRequestEvent[] = []
        // TODO: Implement hostName support
        const user_id = 'aggregate'

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

        const dvcUser = new DVCPopulatedUser(new DVCUser(
            user_id, null, null, null, null, NaN, null, null, null, null
        ))
        this.addEventsToPendingPayloads(
            new UserEventsBatchRecord(dvcUser, aggEvents),
            chunkSize
        )
    }

    private addEventsToPendingPayloads(record: UserEventsBatchRecord, chunkSize: i32): void {
        let flushPayload =  new FlushPayload([])

        while (record.events.length > chunkSize) {
            const batchRecord = new UserEventsBatchRecord(record.user, record.events.splice(0, chunkSize))
            flushPayload.records.push(batchRecord)
            this.pendingPayloads.push(flushPayload)
            flushPayload = new FlushPayload([])
        }
        if (record.events.length > 0) {
            flushPayload.records.push(record)
        }
        if (flushPayload.records.length > 0) {
            this.pendingPayloads.push(flushPayload)
        }
    }

    markPayloadSuccess(payloadId: string): void {
        console.log(`Mark payload: ${payloadId} as success`)
        let index = -1
        for (let i = 0; i < this.pendingPayloads.length; i++) {
            const payload = this.pendingPayloads[i]
            if (payload.payloadId === payloadId) {
                index = i
                break
            }
        }

        if (index < 0) {
            throw new Error(`Could not find payloadId: ${payloadId} to mark as success`)
        } else {
            this.pendingPayloads.splice(index, 1)
        }
    }

    markPayloadFailure(payloadId: string, retryable: boolean): void {
        console.log(`Mark payload: ${payloadId} as failure`)
        let index = -1
        for (let i = 0; i < this.pendingPayloads.length; i++) {
            const payload = this.pendingPayloads[i]
            if (payload.payloadId === payloadId) {
                index = i
                break
            }
        }

        if (index < 0) {
            throw new Error(`Could not find payload: ${payloadId}, retryable: ${retryable} to mark as failure`)
        } else if (retryable) {
            const payload = this.pendingPayloads[index]
            payload.status = 'failed'
        } else {
            this.pendingPayloads.splice(index, 1)
        }
    }

    fetchFailedPayloads(): FlushPayload[] {
        this.pendingPayloads.forEach((payload) => {
            if (payload.status !== 'failed') {
                throw new Error(`Request Payload: ${payload.payloadId} has not finished sending`)
            }
        })
        return this.pendingPayloads
    }
}
