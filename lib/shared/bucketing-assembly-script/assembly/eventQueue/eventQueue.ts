import {
    BucketedUserConfig,
    DVCEvent,
    DVCPopulatedUser,
    EventQueueOptions,
    DVCRequestEvent,
    UserEventsBatchRecord,
    FlushPayload
} from '../types'
import { jsonArrFromValueArray } from '../helpers/jsonHelpers'
import { RequestPayloadManager } from './requestPayloadManager'

export class EventQueue {
    private requestPayloadManager: RequestPayloadManager
    private envKey: string
    private options: EventQueueOptions

    /**
     * Map<user_id, UserEventsBatchRecord>
     */
    private userEventQueue: Map<string, UserEventsBatchRecord>

    /**
     * Map<'aggVariableDefaulted' | 'aggVariableEvaluated,
     *      Map<variable.key,
     *          Map<`${feature_id}.${variation_id}`, counter>
     *      >
     * >
     */
    private aggEventQueue: Map<string, Map<string, Map<string, i64>>>

    constructor(envKey: string, options: EventQueueOptions) {
        this.requestPayloadManager = new RequestPayloadManager(options)
        this.envKey = envKey
        this.options = options
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, Map<string, Map<string, i64>>>()
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
        this.aggEventQueue = new Map<string, Map<string, Map<string, i64>>>()
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
        // this.maxEventQueueSize = bucketedConfig?.project.settings.sdkSettings?.eventQueueLimit ?? this.maxEventQueueSize

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
        variableVariationMap: Map<string, string[]>,
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

        let typeAggMap: Map<string, Map<string, i64>>
        if (this.aggEventQueue.has(type)) {
            typeAggMap = this.aggEventQueue.get(type)
        } else {
            typeAggMap = new Map<string, Map<string, i64>>()
            this.aggEventQueue.set(type, typeAggMap)
        }

        let targetAggMap: Map<string, i64>
        if (typeAggMap.has(target)) {
            targetAggMap = typeAggMap.get(target)
        } else {
            targetAggMap = new Map<string, i64>()
            typeAggMap.set(target, targetAggMap)
        }

        if (aggByVariation) {
            if (!variableVariationMap.has(target)) {
                throw new Error(`Missing variableVariationMap mapping for target: ${target} to aggregate by variation`)
            }

            const targetVariations: string[] = variableVariationMap.get(target)
            for (let i = 0; i < targetVariations.length; i++) {
                const featureKey = targetVariations[i]
                if (targetAggMap.has(featureKey)) {
                    const featureCount: i64 = targetAggMap.get(featureKey)
                    targetAggMap.set(featureKey, featureCount + 1)
                } else {
                    targetAggMap.set(featureKey, 1)
                }
            }
        } else {
            if (targetAggMap.has('value')) {
                const count: i64 = targetAggMap.get('value')
                targetAggMap.set('value', count + 1)
            } else {
                targetAggMap.set('value', 1)
            }
        }
    }
}
