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
    private userEventQueue: Map<string, UserEventsBatchRecord>
    // Map<variable.key, Map<feature/var string, counter>>
    private aggEventQueue: Map<string, Map<string, i64>>

    constructor(envKey: string, options: EventQueueOptions) {
        this.requestPayloadManager = new RequestPayloadManager()
        this.envKey = envKey
        this.options = options
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, Map<string, i64>>()
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
        console.log(`Flush Events Queue for envKey: ${this.envKey}`)

        const failedPayloads = this.requestPayloadManager.fetchFailedPayloads()
        const payloads: FlushPayload[] = this.requestPayloadManager.constructFlushPayloads(
            this.userEventQueue,
            this.aggEventQueue
        )
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, Map<string, i64>>()
        return jsonArrFromValueArray(failedPayloads.concat(payloads)).stringify()
    }

    onPayloadSuccess(payloadId: string): void {
        console.log(`onPayloadSuccess payloadId: ${payloadId}`)
        this.requestPayloadManager.markPayloadSuccess(payloadId)
    }

    onPayloadFailure(payloadId: string, retryable: boolean): void {
        console.log(`onPayloadFailure payloadId: ${payloadId}`)
        this.requestPayloadManager.markPayloadFailure(payloadId, retryable)
    }

    queueEvent(user: DVCPopulatedUser, event: DVCEvent, bucketedConfig: BucketedUserConfig): void {
        console.log(`queueEvent user_id: ${user.user_id}, event: ${event.type}`)

        // TODO: Implement max queue size
        // this.maxEventQueueSize = bucketedConfig?.project.settings.sdkSettings?.eventQueueLimit ?? this.maxEventQueueSize

        const requestEvent = new DVCRequestEvent(event, user.user_id, bucketedConfig.featureVariationMap)
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

    /**
     * See sdk/nodejs/src/eventQueue.ts for context on how this should be implemented.
     *
     * However, the aggregation code will need to be changed to not aggregate based on user_id,
     * but based on variable.key and variableFeatureVariationMap data.
     */
    queueAggregateEvent(event: DVCEvent, bucketedConfig: BucketedUserConfig): void {
        console.log(`queueAggregateEvent event: ${event.type}`)

        event.date = new Date(Date.now())
        // TODO: should we use host.name for user_id?
        const user_id = 'aggregate'
        const requestEvent = new DVCRequestEvent(event, user_id, bucketedConfig.featureVariationMap)
        this.saveAggEvent(requestEvent, bucketedConfig)
    }

    private saveAggEvent(event: DVCRequestEvent, bucketedConfig: BucketedUserConfig): void {
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

        let targetAggMap: Map<string, i64>
        if (this.aggEventQueue.has(target)) {
            targetAggMap = this.aggEventQueue.get(target)
        } else {
            targetAggMap = new Map<string, i64>()
            this.aggEventQueue.set(target, targetAggMap)
        }

        // TODO: Do we need to check that the type is aggVariableEvaluated here?
        if (bucketedConfig.variableVariationMap.has(target)) {
            const targetVariations: string[] = bucketedConfig.variableVariationMap.get(target)

            for (let i = 0; i < targetVariations.length; i++) {
                const featureKey = targetVariations[i]
                let featureCount: i64
                if (targetAggMap.has(featureKey)) {
                    featureCount = targetAggMap.get(featureKey)
                    targetAggMap.set(featureKey, featureCount++)
                } else {
                    targetAggMap.set(featureKey, 1)
                }
            }
        } else {
            // TODO: Do we need to check that the type is aggVariableDefaulted here?
            if (event.value) {
                event.value = event.value++
            } else {
                event.value = 1
            }
        }
    }
}
