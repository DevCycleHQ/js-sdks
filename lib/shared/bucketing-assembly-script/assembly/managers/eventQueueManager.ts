import { EventQueue } from '../eventQueue/eventQueue'
import { EventQueueOptions, DVCPopulatedUser, DVCEvent } from '../types'
import { getStringArrayMapFromJSONObj } from '../helpers/jsonHelpers'
import { JSON } from 'assemblyscript-json/assembly'
import { _getConfigData } from './configDataManager'
import { _generateBucketedConfig } from '../bucketing'

const _eventQueueMap: Map<string, EventQueue> = new Map()

function getEventQueue(envKey: string): EventQueue {
    if (!_eventQueueMap.has(envKey)) {
        throw new Error(`No Event Queue found for envKey: ${envKey}`)
    }
    return _eventQueueMap.get(envKey)
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
    if (_eventQueueMap.has(envKey)) {
        throw new Error(`Event Queue already exists for envKey: ${envKey}`)
    }

    const options = new EventQueueOptions(optionsStr)
    const queue = new EventQueue(envKey, options)
    _eventQueueMap.set(envKey, queue)
}

export function flushEventQueue(envKey: string): string {
    const eventQueue = getEventQueue(envKey)
    return eventQueue.flush()
}

export function onPayloadSuccess(envKey: string, payloadId: string): void {
    const eventQueue = getEventQueue(envKey)
    eventQueue.onPayloadSuccess(payloadId)
}

export function onPayloadFailure(envKey: string, payloadId: string, retryable: boolean): void {
    const eventQueue = getEventQueue(envKey)
    eventQueue.onPayloadFailure(payloadId, retryable)
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
    const variableVariationMap = getStringArrayMapFromJSONObj(variableVariationMapJSON as JSON.Obj)

    const aggByVariation = (event.type === 'aggVariableEvaluated')
    eventQueue.queueAggregateEvent(event, variableVariationMap, aggByVariation)
}
