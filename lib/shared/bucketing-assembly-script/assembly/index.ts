import { JSON } from 'assemblyscript-json/assembly'
import { ConfigBody, DVCPopulatedUser, FeatureVariation, PlatformData } from './types'
import {
    _generateBoundedHashes,
    _generateBucketedConfig,
    _generateBucketedVariableForUser
} from './bucketing'
import { _clearPlatformData, _setPlatformData } from './managers/platformDataManager'
import { _getConfigData, _hasConfigData, _setConfigData } from './managers/configDataManager'
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

export enum VariableType {
    Boolean,
    Number,
    String,
    JSON
}
const VariableTypeStrings = ['Boolean', 'Number', 'String', 'JSON']

export function variableForUser(
    sdkKey: string,
    userStr: string,
    variableKey: string,
    variableType: VariableType
): string | null {
    const config = _getConfigData(sdkKey)
    const user = DVCPopulatedUser.fromJSONString(userStr)

    const response = _generateBucketedVariableForUser(config, user, variableKey, _getClientCustomData(sdkKey))
    let variable = (response && response.variable) ? response.variable : null
    if (variable && variable.type !== VariableTypeStrings[variableType]) {
        variable = null
    }

    const variableVariationMap = new Map<string, FeatureVariation>()
    if (response) {
        variableVariationMap.set(variableKey, new FeatureVariation(
            response.feature._id,
            response.variation._id
        ))
    }
    queueVariableEvaluatedEvent(sdkKey, variableVariationMap, variable, variableKey)

    return variable ? variable.stringify() : null
}

export function setPlatformData(platformDataStr: string): void {
    const platformData = new PlatformData(platformDataStr)
    _setPlatformData(platformData)
}

// Add empty input string to make AS compiler work
export function clearPlatformData(empty: string | null = null): void {
    _clearPlatformData()
}

export function setConfigData(sdkKey: string, configDataStr: string): void {
    const configData = new ConfigBody(configDataStr)
    _setConfigData(sdkKey, configData)
}

export function setConfigDataWithEtag(sdkKey: string, configDataStr: string, etag: string): void {
    const configData = new ConfigBody(configDataStr, etag)
    _setConfigData(sdkKey, configData)
}

export function hasConfigDataForEtag(sdkKey: string, etag: string): bool {
    if (!_hasConfigData(sdkKey)) return false
    const configData = _getConfigData(sdkKey)
    return configData && configData.etag !== null && configData.etag === etag
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
