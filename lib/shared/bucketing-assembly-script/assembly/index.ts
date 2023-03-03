import {
    _generateBoundedHashes, _generateBucketedConfig,
} from './bucketing'

import { JSON } from 'assemblyscript-json/assembly'
import { ConfigBody, DVCPopulatedUser, PlatformData } from './types'
import { _clearPlatformData, _setPlatformData } from './managers/platformDataManager'
import { _getConfigData, _setConfigData } from './managers/configDataManager'
import { _getClientCustomData, _setClientCustomData } from './managers/clientCustomDataManager'
import { queueVariableEvaluatedEvent } from './managers/eventQueueManager'

export function generateBoundedHashesFromJSON(user_id: string, target_id: string): string {
    const boundedHash = _generateBoundedHashes(user_id, target_id)
    const json = new JSON.Obj()
    json.set('rolloutHash', boundedHash.rolloutHash)
    json.set('bucketingHash', boundedHash.bucketingHash)
    return json.stringify()
}

export function generateBucketedConfigForUser(sdkKey: string, userStr: string): string  {
    const config = _getConfigData(sdkKey)
    const user = DVCPopulatedUser.fromJSONString(userStr)

    const bucketedConfig = _generateBucketedConfig(config, user, _getClientCustomData(sdkKey))
    return bucketedConfig.stringify()
}

export function variableForUser(sdkKey: string, userStr: string, variableKey: string): string | null {
    const config = _getConfigData(sdkKey)
    const user = DVCPopulatedUser.fromJSONString(userStr)

    const bucketedConfig = _generateBucketedConfig(config, user, _getClientCustomData(sdkKey))
    const variable = bucketedConfig.variables.has(variableKey)
        ? bucketedConfig.variables.get(variableKey)
        : null

    queueVariableEvaluatedEvent(sdkKey, bucketedConfig, variable, variableKey)

    return variable ? variable.stringify() : null
}

export function setPlatformData(platformDataStr: string): void {
    const platformData = new PlatformData(platformDataStr)
    _setPlatformData(platformData)
}

// Add empty input string to make AS compiler work
export function clearPlatformData(empty: string): void {
    _clearPlatformData()
}

export function setConfigData(sdkKey: string, configDataStr: string): void {
    const configData = new ConfigBody(configDataStr)
    _setConfigData(sdkKey, configData)
}

export function setClientCustomData(sdkKey: string, data: string): void {
    const parsed = JSON.parse(data)
    if (!parsed.isObj) {
        throw new Error('invalid global data')
    }

    _setClientCustomData(sdkKey, parsed as JSON.Obj)
}

export * from './managers/eventQueueManager'

export * from './testHelpers'

export { murmurhashV3, murmurhashV3_js } from './helpers/murmurhash'
