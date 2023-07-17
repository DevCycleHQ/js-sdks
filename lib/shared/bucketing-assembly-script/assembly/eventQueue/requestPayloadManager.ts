import {
    DVCEvent,
    DVCUser,
    DVCPopulatedUser,
    DVCRequestEvent,
    FlushPayload,
    UserEventsBatchRecord,
    EventQueueOptions,
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { _getPlatformData } from '../managers/platformDataManager'
import {
    AggEventQueue,
    FeatureAggMap,
    VariableAggMap,
    VariationAggMap,
} from './eventQueue'

/**
 * This RequestPayloadManager Class handles all the logic for creating event flushing payloads,
 * and handling the onSuccess and onFailure logic for those payloads.
 */
export class RequestPayloadManager {
    private pendingPayloads: Map<string, FlushPayload>
    private readonly chunkSize: i32

    constructor(options: EventQueueOptions) {
        this.pendingPayloads = new Map<string, FlushPayload>()
        this.chunkSize = options.eventRequestChunkSize
    }

    constructFlushPayloads(
        userEventQueue: Map<string, UserEventsBatchRecord>,
        aggEventQueue: AggEventQueue,
    ): FlushPayload[] {
        this.checkForFailedPayloads()

        const records = this.constructBatchRecordsFromUserEvents(userEventQueue)
        records.push(this.constructBatchRecordsFromAggEvents(aggEventQueue))
        this.addEventRecordsToPendingPayloads(records)

        this.updateFailedPayloads()
        return this.pendingPayloads.values()
    }

    /**
     * Generate UserEventsBatchRecord from User Event Queue
     */
    private constructBatchRecordsFromUserEvents(
        userEventQueue: Map<string, UserEventsBatchRecord>,
    ): UserEventsBatchRecord[] {
        const records = new Array<UserEventsBatchRecord>()
        const userEventQueueValues = userEventQueue.values()

        for (let i = 0; i < userEventQueueValues.length; i++) {
            records.push(userEventQueueValues[i])
        }
        return records
    }

    /**
     * generate aggregated events by resolving aggregated event map into DVCEvents.
     */
    private constructBatchRecordsFromAggEvents(
        aggEventQueue: AggEventQueue,
    ): UserEventsBatchRecord {
        const aggEventQueueKeys = aggEventQueue.keys()
        const aggEvents: DVCRequestEvent[] = []

        const platformData = _getPlatformData()
        const user_id = platformData.hostname
            ? (platformData.hostname as string)
            : 'aggregate'
        const emptyFeatureVars = new Map<string, string>()

        for (let i = 0; i < aggEventQueueKeys.length; i++) {
            const type = aggEventQueueKeys[i]
            const variableAggMap: VariableAggMap = aggEventQueue.get(type)
            const variableFeatureVarAggMapKeys = variableAggMap.keys()

            for (let y = 0; y < variableFeatureVarAggMapKeys.length; y++) {
                const variableKey = variableFeatureVarAggMapKeys[y]
                const featureVarAggMap: FeatureAggMap =
                    variableAggMap.get(variableKey)

                let value: f64 = NaN
                if (featureVarAggMap.has('value')) {
                    const varAggMap = featureVarAggMap.get('value')
                    if (varAggMap.has('value')) {
                        value = f64(varAggMap.get('value'))

                        // Add aggVariableDefaulted Events
                        const dvcEvent = new DVCEvent(
                            type,
                            variableKey,
                            null,
                            value,
                            null,
                        )
                        aggEvents.push(
                            new DVCRequestEvent(
                                dvcEvent,
                                user_id,
                                emptyFeatureVars,
                            ),
                        )
                    } else {
                        throw new Error(
                            'Missing sub value map to write aggVariableDefaulted events',
                        )
                    }
                } else {
                    const featureVarAggMapKeys = featureVarAggMap.keys()

                    for (let x = 0; x < featureVarAggMapKeys.length; x++) {
                        const _feature = featureVarAggMapKeys[x]
                        const variationAggMap: VariationAggMap =
                            featureVarAggMap.get(_feature)
                        const variationAggMapKeys = variationAggMap.keys()

                        for (let z = 0; z < variationAggMapKeys.length; z++) {
                            const _variation = variationAggMapKeys[z]
                            value = f64(variationAggMap.get(_variation))

                            const metaData = new JSON.Obj()
                            metaData.set('_feature', _feature)
                            metaData.set('_variation', _variation)

                            // Add aggVariableEvaluated Events
                            const dvcEvent = new DVCEvent(
                                type,
                                variableKey,
                                null,
                                value,
                                metaData,
                            )
                            aggEvents.push(
                                new DVCRequestEvent(
                                    dvcEvent,
                                    user_id,
                                    emptyFeatureVars,
                                ),
                            )
                        }
                    }
                }
            }
        }

        // Generate defaulted aggregate user as our events APIs require a user / user_id
        const dvcUser = new DVCPopulatedUser(
            new DVCUser(
                user_id,
                null,
                null,
                null,
                null,
                NaN,
                null,
                null,
                null,
                null,
            ),
        )
        return new UserEventsBatchRecord(dvcUser, aggEvents)
    }

    /**
     * Find existing FlushPayload that is less than this.chunkSize, and isn't a failed payload
     */
    private getFlushPayload(): FlushPayload {
        const payloads = this.pendingPayloads.values()

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i]
            if (payload.status === 'failed') {
                continue
            }
            if (payload.eventCount() < this.chunkSize) {
                return payload
            }
        }

        return new FlushPayload([])
    }

    /**
     * Chunk up UserEventsBatchRecord's into payloads of size: this.chunkSize
     */
    private addEventRecordsToPendingPayloads(
        records: UserEventsBatchRecord[],
    ): void {
        for (let i = 0; i < records.length; i++) {
            const record: UserEventsBatchRecord = records[i]

            while (record.events.length > 0) {
                const flushPayload = this.getFlushPayload()
                flushPayload.addBatchRecordForUser(record, this.chunkSize)
                if (flushPayload.records.length > 0) {
                    this.pendingPayloads.set(
                        flushPayload.payloadId,
                        flushPayload,
                    )
                }
            }
        }
    }

    /**
     * Mark pending payload as success, remove from pending payloads array.
     */
    markPayloadSuccess(payloadId: string): void {
        if (!this.pendingPayloads.has(payloadId)) {
            throw new Error(
                `Could not find payloadId: ${payloadId} to mark as success`,
            )
        }

        this.pendingPayloads.delete(payloadId)
    }

    markPayloadFailure(payloadId: string, retryable: boolean): void {
        if (!this.pendingPayloads.has(payloadId)) {
            throw new Error(
                `Could not find payload: ${payloadId}, retryable: ${retryable} to mark as failure`,
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
            if (payload.status !== 'failed') {
                throw new Error(
                    `Request Payload: ${payload.payloadId} has not finished sending`,
                )
            }
        })
    }

    /**
     * Update all the failed payload statuses to sending after generating all new payloads to be sent.
     */
    updateFailedPayloads(): void {
        this.pendingPayloads.values().forEach((payload) => {
            if (payload.status === 'failed') {
                payload.status = 'sending'
            }
        })
    }

    payloadEventCount(): i32 {
        return this.pendingPayloads.values().reduce((count: i32, payload) => {
            return count + payload.eventCount()
        }, 0 as i32)
    }
}
