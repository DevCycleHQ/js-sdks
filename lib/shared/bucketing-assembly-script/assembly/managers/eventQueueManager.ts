import { EventQueue } from '../eventQueue/eventQueue'
import {
    EventQueueOptions,
    DVCPopulatedUser,
    DVCEvent,
    FeatureVariation
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { _getConfigData } from './configDataManager'
import { _generateBucketedConfig } from '../bucketing'
import { RequestPayloadManager } from '../eventQueue/requestPayloadManager'
import { jsonArrFromValueArray } from '../helpers/jsonHelpers'

/**
 * Map<environmentKey, EventQueue>
 */
const _eventQueueMap = new Map<string, EventQueue>()

function getEventQueue(envKey: string): EventQueue {
    if (!_eventQueueMap.has(envKey)) {
        throw new Error(`No Event Queue found for envKey: ${envKey}`)
    }
    return _eventQueueMap.get(envKey)
}

const _requestPayloadMap = new Map<string, RequestPayloadManager>()

function getRequestPayloadManager(envKey: string): RequestPayloadManager {
    if (!_requestPayloadMap.has(envKey)) {
        throw new Error(`No Request Payload Manager found for envKey: ${envKey}`)
    }
    return _requestPayloadMap.get(envKey)
}

/**
 * This should be called from the Native code where the existing EventQueue Class is setup.
 * This creates the WASM EventQueue class and stores it in a map by env envKey,
 * this is needed because our SDKs support creating multiple DVCClient objects by token.
 */
export function initEventQueue(envKey: string, optionsStr: string): void {
    if (!envKey) {
        throw new Error('Missing envKey to initialize Event Queue')
    }
    if (_eventQueueMap.has(envKey) || _requestPayloadMap.has(envKey)) {
        throw new Error(`Event Queue already exists for envKey: ${envKey}`)
    }

    const options = new EventQueueOptions(optionsStr)

    const queue = new EventQueue(envKey, options)
    _eventQueueMap.set(envKey, queue)

    const requestPayloadManager = new RequestPayloadManager(options)
    _requestPayloadMap.set(envKey, requestPayloadManager)
}

/**
 * This should be called by the native code on an interval set by the `eventFlushIntervalMS` option.
 * It will generate an array of payloads, with each payload up to a maximum batch size
 * (should be configurable by an option, nodejs uses 100).
 *
 * It should take the data from the eventQueue and aggregate events and generate request payloads.
 * After generating these payloads it should clear the data from the eventQueue and aggregate events queues.
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
export function flushEventQueue(envKey: string): string {
    const eventQueue = getEventQueue(envKey)
    const requestPayloadManager = getRequestPayloadManager(envKey)

    const eventQueues = eventQueue.flushAndResetEventQueue()
    const payloads = requestPayloadManager.constructFlushPayloads(
        eventQueues.userEventQueue,
        eventQueues.aggEventQueue
    )
    return jsonArrFromValueArray(payloads).stringify()
}

export function onPayloadSuccess(envKey: string, payloadId: string): void {
    const requestPayloadManager = getRequestPayloadManager(envKey)
    requestPayloadManager.markPayloadSuccess(payloadId)
}

export function onPayloadFailure(envKey: string, payloadId: string, retryable: boolean): void {
    const requestPayloadManager = getRequestPayloadManager(envKey)
    requestPayloadManager.markPayloadFailure(payloadId, retryable)
}

export function queueEvent(
    envKey: string,
    userStr: string,
    eventStr: string
): void {
    const eventQueue = getEventQueue(envKey)
    const dvcUser = DVCPopulatedUser.fromJSONString(userStr)
    const event = DVCEvent.fromJSONString(eventStr)

    const bucketedConfig = _generateBucketedConfig(_getConfigData(envKey), dvcUser)
    eventQueue.queueEvent(dvcUser, event, bucketedConfig.featureVariationMap)
}

export function queueAggregateEvent(
    envKey: string,
    eventStr: string,
    variableVariationMapStr: string
): void {
    const eventQueue = getEventQueue(envKey)
    const event = DVCEvent.fromJSONString(eventStr)

    const variableVariationMapJSON = JSON.parse(variableVariationMapStr)
    if (!variableVariationMapJSON.isObj) throw new Error('variableVariationMap is not a JSON Object')
    const variableVariationMap = FeatureVariation.getVariableVariationMapFromJSONObj(
        variableVariationMapJSON as JSON.Obj
    )

    const aggByVariation = (event.type === 'aggVariableEvaluated')
    eventQueue.queueAggregateEvent(event, variableVariationMap, aggByVariation)
}

export function cleanupEventQueue(envKey: string): void {
    if (_eventQueueMap.has(envKey)) {
        _eventQueueMap.delete(envKey)
    }
    if (_requestPayloadMap.has(envKey)) {
        _requestPayloadMap.delete(envKey)
    }
}

export function eventQueueSize(envKey: string): i32 {
    const eventQueue = getEventQueue(envKey)
    const requestPayloadManager = getRequestPayloadManager(envKey)
    return eventQueue.eventQueueCount + requestPayloadManager.payloadEventCount()
}
