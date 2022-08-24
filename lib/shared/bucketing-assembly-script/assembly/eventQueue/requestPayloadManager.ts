import {
    FlushPayload,
    UserEventsBatchRecord
} from '../types'

/**
 * This RequestPayloadManager Class handles all the logic for creating event flushing payloads,
 * and handling the onSuccess and onFailure logic for those payloads.
 */
export class RequestPayloadManager {
    private pendingPayloads: FlushPayload[] = []

    constructFlushPayloads(
        userEventQueue: Map<string, UserEventsBatchRecord>,
        aggEventQueue: Map<string, Map<string, i64>>,
        chunkSize: i32 = 100
    ): FlushPayload[] {
        this.pendingPayloads = []

        const userEventQueueKeys = userEventQueue.keys()
        for (let i = 0; i < userEventQueueKeys.length; i++) {
            const key = userEventQueueKeys[i]
            const userEventsRecord = userEventQueue.get(key)
            this.addEventToCurrentAggregator(userEventsRecord, chunkSize)
        }

        // TODO: add agg events

        return this.pendingPayloads
    }

    private addEventToCurrentAggregator(record: UserEventsBatchRecord, chunkSize: i32): void {
        let lastPayload = this.pendingPayloads.length > 0 ? this.pendingPayloads.pop() : new FlushPayload([])
        if (lastPayload.records.length >= chunkSize) {
            this.pendingPayloads.push(lastPayload)
            lastPayload = new FlushPayload([])
        }

        while (record.events.length > chunkSize) {
            const batchRecord = new UserEventsBatchRecord(record.user, record.events.splice(0, chunkSize))
            lastPayload.records.push(batchRecord)
            this.pendingPayloads.push(lastPayload)
            lastPayload = new FlushPayload([])
        }
        if (record.events.length > 0) {
            lastPayload.records.push(record)
        }
        if (lastPayload.records.length > 0) {
            this.pendingPayloads.push(lastPayload)
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
