import {
    DVCEvent,
    DVCPopulatedUser,
    EventQueueOptions,
    DVCRequestEvent,
    UserEventsBatchRecord,
    FlushPayload,
    FeatureVariation
} from '../types'
import { jsonArrFromValueArray } from '../helpers/jsonHelpers'
import { RequestPayloadManager } from './requestPayloadManager'

export type AggEventQueue = Map<string, Map<string, Map<string, Map<string, i64>>>>

export class EventQueue {
    private requestPayloadManager: RequestPayloadManager
    private envKey: string
    private options: EventQueueOptions

    /**
     * Map<user_id, UserEventsBatchRecord>
     */
    private userEventQueue: Map<string, UserEventsBatchRecord>

    /**
     * Map<'aggVariableDefaulted',
     *      Map<variable.key,
     *          Map<'value',
     *              Map<'value', counter>
     *          >
     *      >
     * >
     *
     * Map<'aggVariableEvaluated',
     *      Map<variable.key,
     *          Map<feature._id,
     *              Map<variation_id, counter>
     *          >
     *      >
     * >
     */
    private aggEventQueue: AggEventQueue

    constructor(envKey: string, options: EventQueueOptions) {
        this.requestPayloadManager = new RequestPayloadManager(options)
        this.envKey = envKey
        this.options = options
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, Map<string, Map<string, Map<string, i64>>>>()
    }

    /**
     * See sdk/nodejs/src/eventQueue.ts for rough context on how this should be implemented,
     * with these changes described below:
     *
     * This should be called by the native code on an interval set by the `flushEventsMS` option.
     * It will generate an array of payloads, with each payload up to a maximum batch size
     * (should be configurable by an option, nodejs uses 100).
     *
     * It should take the data from the eventQueue and aggregate events and generate request payloads.
     * After generating these paylods it should clear the data from the eventQueue and aggregate events queues.
     * The payload objects should be stored in a sending paylods queue with their status of 'inProgress'.
     * Each Payload object should generate a unique payloadId that will be used for the onPayloadSuccess() and
     * onPayloadFailure() methods.
     *
     * If onPayloadSuccess() is called for a payloadId, it can be removed from the sending payloads queue.
     *
     * If onPayloadFailure() is called for a payloadId and retryable = true, it should be marked as 'failed'.
     * If it retryable = false, it should be removed from the sending payload queue.
     * Then on subsequent calls to `flush()` the 'failed' payloads should be marked as 'inProgress' and returned
     * as payloads to be sent by the Native code again.
     *
     * If there are payloads that are still marked as `inProgress` when `flush()` is called, it should return an
     * exception to the native code.
     */
    flush(): string {
        const payloads: FlushPayload[] = this.requestPayloadManager.constructFlushPayloads(
            this.userEventQueue,
            this.aggEventQueue
        )
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, Map<string, Map<string, Map<string, i64>>>>()
        return jsonArrFromValueArray(payloads).stringify()
    }

    onPayloadSuccess(payloadId: string): void {
        this.requestPayloadManager.markPayloadSuccess(payloadId)
    }

    onPayloadFailure(payloadId: string, retryable: boolean): void {
        this.requestPayloadManager.markPayloadFailure(payloadId, retryable)
    }

    queueEvent(user: DVCPopulatedUser, event: DVCEvent, featureVariationMap: Map<string, string>): void {
        // TODO: Implement max queue size
        // this.maxEventQueueSize = bucketedConfig?.project.settings.sdkSettings?.eventQueueLimit
        // ?? this.maxEventQueueSize

        const requestEvent = new DVCRequestEvent(event, user.user_id, featureVariationMap)
        this.addEventToQueue(user, requestEvent)
    }

    private addEventToQueue(user: DVCPopulatedUser, event: DVCRequestEvent): void {
        // TODO: implement?
        // if (this.eventQueueSize() >= this.maxEventQueueSize) {
        //     this.logger.warn(`Max event queue size reached, dropping event: ${event}`)
        //     this.flushEvents()
        //     return
        // }

        const user_id = user.user_id
        let userEvents: UserEventsBatchRecord
        if (!this.userEventQueue.has(user_id)) {
            userEvents = new UserEventsBatchRecord(user, [])
            this.userEventQueue.set(user_id, userEvents)
        } else {
            userEvents = this.userEventQueue.get(user_id)
            userEvents.user = user
        }
        userEvents.events.push(event)
    }

    queueAggregateEvent(
        event: DVCEvent,
        variableVariationMap: Map<string, FeatureVariation>,
        aggByVariation: boolean
    ): void {
        const type = event.type
        const target = event.target
        if (!target) {
            throw new Error('Event missing target to save aggregate event')
        }

        // TODO: implement?
        // if (this.eventQueueSize() >= this.maxEventQueueSize) {
        //     this.logger.warn(`Max event queue size reached, dropping aggregate event: ${event}`)
        //     this.flushEvents()
        //     return
        // }

        let variableFeatureVarAggMap: Map<string, Map<string, Map<string, i64>>>
        if (this.aggEventQueue.has(type)) {
            variableFeatureVarAggMap = this.aggEventQueue.get(type)
        } else {
            variableFeatureVarAggMap = new Map<string, Map<string, Map<string, i64>>>()
            this.aggEventQueue.set(type, variableFeatureVarAggMap)
        }

        let featureVarAggMap: Map<string, Map<string, i64>>
        if (variableFeatureVarAggMap.has(target)) {
            featureVarAggMap = variableFeatureVarAggMap.get(target)
        } else {
            featureVarAggMap = new Map<string, Map<string, i64>>()
            variableFeatureVarAggMap.set(target, featureVarAggMap)
        }

        if (aggByVariation) {
            if (!variableVariationMap.has(target)) {
                throw new Error(`Missing variableVariationMap mapping for target: ${target} to aggregate by variation`)
            }
            const featureVariation: FeatureVariation = variableVariationMap.get(target)

            let variationAggMap: Map<string, i64>
            if (featureVarAggMap.has(featureVariation._feature)) {
                variationAggMap = featureVarAggMap.get(featureVariation._feature)
            } else {
                variationAggMap = new Map<string, i64>()
                featureVarAggMap.set(featureVariation._feature, variationAggMap)
            }

            if (variationAggMap.has(featureVariation._variation)) {
                const variationCount: i64 = variationAggMap.get(featureVariation._variation)
                variationAggMap.set(featureVariation._variation, variationCount + 1)
            } else {
                variationAggMap.set(featureVariation._variation, 1)
            }
        } else {
            /**
             * Because `aggEventQueue` is now aggregated by both feature and variation,
             * we need to set an empty map here to fit the same schema for tracking `aggVariableDefaulted` events.
             */
            if (featureVarAggMap.has('value')) {
                const variationAggMap: Map<string, i64> = featureVarAggMap.get('value')
                if (variationAggMap.has('value')) {
                    const count: i64 = variationAggMap.get('value')
                    variationAggMap.set('value', count + 1)
                } else {
                    throw new Error('Missing second value map for aggVariableDefaulted')
                }
            } else {
                const variationAggMap = new Map<string, i64>()
                variationAggMap.set('value', 1)
                featureVarAggMap.set('value', variationAggMap)
            }
        }
    }
}
