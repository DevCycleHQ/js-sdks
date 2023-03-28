import { EventQueue } from '../eventQueue/eventQueue'
import {
    EventQueueOptions,
    DVCPopulatedUser,
    DVCEvent,
    FeatureVariation,
    SDKVariable, decodeDVCUser_PB, DVCUser
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { _getConfigData } from './configDataManager'
import { _generateBucketedConfig } from '../bucketing'
import { RequestPayloadManager } from '../eventQueue/requestPayloadManager'
import { jsonArrFromValueArray } from '../helpers/jsonHelpers'
import { _getClientCustomData, _getClientCustomDataJSON } from './clientCustomDataManager'
import { DVCPopulatedUserPB } from '../types/dvcUserPB'

/**
 * Map<sdkKey, EventQueue>
 */
const _eventQueueMap = new Map<string, EventQueue>()

function getEventQueue(sdkKey: string): EventQueue {
    if (!_eventQueueMap.has(sdkKey)) {
        throw new Error(`No Event Queue found for sdkKey: ${sdkKey}`)
    }
    return _eventQueueMap.get(sdkKey)
}

const _requestPayloadMap = new Map<string, RequestPayloadManager>()

function getRequestPayloadManager(sdkKey: string): RequestPayloadManager {
    if (!_requestPayloadMap.has(sdkKey)) {
        throw new Error(`No Request Payload Manager found for sdkKey: ${sdkKey}`)
    }
    return _requestPayloadMap.get(sdkKey)
}

/**
 * This should be called from the Native code where the existing EventQueue Class is setup.
 * This creates the WASM EventQueue class and stores it in a map by env sdkKey,
 * this is needed because our SDKs support creating multiple DVCClient objects by sdkKey.
 */
export function initEventQueue(sdkKey: string, optionsStr: string): void {
    if (!sdkKey) {
        throw new Error('Missing sdkKey to initialize Event Queue')
    }
    if (_eventQueueMap.has(sdkKey) || _requestPayloadMap.has(sdkKey)) {
        throw new Error(
            `Event Queue already exists for sdkKey: ${sdkKey}, ` +
            'you can only initialize the DevCycle SDK once per sdkKey'
        )
    }

    const options = new EventQueueOptions(optionsStr)

    const queue = new EventQueue(sdkKey, options)
    _eventQueueMap.set(sdkKey, queue)

    const requestPayloadManager = new RequestPayloadManager(options)
    _requestPayloadMap.set(sdkKey, requestPayloadManager)
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
export function flushEventQueue(sdkKey: string): string {
    const eventQueue = getEventQueue(sdkKey)
    const requestPayloadManager = getRequestPayloadManager(sdkKey)

    const eventQueues = eventQueue.flushAndResetEventQueue()
    const payloads = requestPayloadManager.constructFlushPayloads(
        eventQueues.userEventQueue,
        eventQueues.aggEventQueue
    )
    return jsonArrFromValueArray(payloads).stringify()
}

export function onPayloadSuccess(sdkKey: string, payloadId: string): void {
    const requestPayloadManager = getRequestPayloadManager(sdkKey)
    requestPayloadManager.markPayloadSuccess(payloadId)
}

export function onPayloadFailure(sdkKey: string, payloadId: string, retryable: boolean): void {
    const requestPayloadManager = getRequestPayloadManager(sdkKey)
    requestPayloadManager.markPayloadFailure(payloadId, retryable)
}

export function queueEvent(sdkKey: string, userStr: Uint8Array, eventStr: string): void {
    const eventQueue = getEventQueue(sdkKey)
    const data = decodeDVCUser_PB(userStr)
    const dvcUser = new DVCPopulatedUserPB(data)
    const jsonUser = new DVCPopulatedUser(DVCUser.fromPBUser(data))
    const event = DVCEvent.fromJSONString(eventStr)
    const bucketedConfig = _generateBucketedConfig(_getConfigData(sdkKey), dvcUser, _getClientCustomData(sdkKey))
    jsonUser.mergeClientCustomData(_getClientCustomDataJSON(sdkKey))
    eventQueue.queueEvent(jsonUser, event, bucketedConfig.featureVariationMap)
}

export function queueAggregateEvent(sdkKey: string, eventStr: string, variableVariationMapStr: string): void {
    const eventQueue = getEventQueue(sdkKey)
    if (eventQueue.options.disableAutomaticEventLogging) return

    const event = DVCEvent.fromJSONString(eventStr)

    const variableVariationMapJSON = JSON.parse(variableVariationMapStr)
    if (!variableVariationMapJSON.isObj) throw new Error('variableVariationMap is not a JSON Object')
    const variableVariationMap = FeatureVariation.getVariableVariationMapFromJSONObj(
        variableVariationMapJSON as JSON.Obj
    )

    const aggByVariation = (event.type === 'aggVariableEvaluated')
    eventQueue.queueAggregateEvent(event, variableVariationMap, aggByVariation)
}

/**
 * Use for testing to pass in JSON strings to be parsed and call queueVariableEvaluatedEvent() with.
 */
export function queueVariableEvaluatedEvent_JSON(
    sdkKey: string,
    varVariationMapString: string,
    variable: string | null,
    variableKey: string
): void {
    const varVariationMapJSON = JSON.parse(varVariationMapString)
    if (!varVariationMapJSON.isObj) throw new Error('varVariationMap is not a JSON Object')
    const varVariationObj = varVariationMapJSON as JSON.Obj

    const varVariationMap = new Map<string, FeatureVariation>()
    for (let i = 0; i < varVariationObj.keys.length; i++) {
        const key = varVariationObj.keys[i]
        const value = varVariationObj.get(key)
        if (!value || !value.isObj) throw new Error('FeatureVariation value is not a JSON Object')
        varVariationMap.set(key, FeatureVariation.fromJSONObj(value as JSON.Obj))
    }

    return queueVariableEvaluatedEvent(
        sdkKey,
        varVariationMap,
        (variable !== null) ? SDKVariable.fromJSONString(variable) : null,
        variableKey
    )
}

export function queueVariableEvaluatedEvent(
    sdkKey: string,
    variableVariationMap: Map<string, FeatureVariation>,
    variable: SDKVariable | null,
    variableKey: string
): void {
    const eventQueue = getEventQueue(sdkKey)
    if (eventQueue.options.disableAutomaticEventLogging) return

    const eventType = (variable !== null)
        ? 'aggVariableEvaluated'
        : 'aggVariableDefaulted'

    const event = new DVCEvent(
        eventType,
        variableKey,
        null,
        NaN,
        null
    )

    const aggByVariation = (eventType === 'aggVariableEvaluated')
    eventQueue.queueAggregateEvent(event, variableVariationMap, aggByVariation)
}

export function cleanupEventQueue(sdkKey: string): void {
    if (_eventQueueMap.has(sdkKey)) {
        _eventQueueMap.delete(sdkKey)
    }
    if (_requestPayloadMap.has(sdkKey)) {
        _requestPayloadMap.delete(sdkKey)
    }
}

export function eventQueueSize(sdkKey: string): i32 {
    const eventQueue = getEventQueue(sdkKey)
    const requestPayloadManager = getRequestPayloadManager(sdkKey)
    return eventQueue.eventQueueCount + requestPayloadManager.payloadEventCount()
}
