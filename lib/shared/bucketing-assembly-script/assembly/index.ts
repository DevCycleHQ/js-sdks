import { JSON } from 'assemblyscript-json/assembly'
import {
    ConfigBody,
    DVCPopulatedUser,
    FeatureVariation,
    PlatformData,
    DVCUser,
    SDKVariable,
    VariableForUserParams_PB,
    decodeVariableForUserParams_PB, VariableType_PB
} from './types'
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
export const VariableTypeStrings = ['Boolean', 'Number', 'String', 'JSON']

function variableTypeFromPB(pb: VariableType_PB): VariableType {
    switch (pb) {
        case VariableType_PB.Boolean: return VariableType.Boolean
        case VariableType_PB.Number: return VariableType.Number
        case VariableType_PB.String: return VariableType.String
        case VariableType_PB.JSON: return VariableType.JSON
        default: throw new Error(`Unknown variable type: ${pb}`)
    }
}

export function variableForUser_PB(protobuf: Uint8Array): Uint8Array | null {
    const params: VariableForUserParams_PB = decodeVariableForUserParams_PB(protobuf)
    const user = params.user
    if (!user) throw new Error('Missing user from variableForUser_PB protobuf')
    const dvcUser = new DVCPopulatedUser(DVCUser.fromPBUser(user))

    const variable = _variableForDVCUser(
        params.sdkKey,
        dvcUser,
        params.variableKey,
        variableTypeFromPB(params.variableType),
        params.shouldTrackEvent
    )

    return variable ? variable.toProtobuf() : null
}

function _variableForDVCUser(
    sdkKey: string,
    dvcUser: DVCPopulatedUser,
    variableKey: string,
    variableType: VariableType,
    shouldTrackEvent: boolean
): SDKVariable | null {
    const config = _getConfigData(sdkKey)
    const response = _generateBucketedVariableForUser(config, dvcUser, variableKey, _getClientCustomData(sdkKey))

    let variable: SDKVariable | null = (response && response.variable) ? response.variable : null
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

    if (shouldTrackEvent) {
        queueVariableEvaluatedEvent(sdkKey, variableVariationMap, variable, variableKey)
    }
    return variable
}

export function variableForUser(
    sdkKey: string,
    userStr: string,
    variableKey: string,
    variableType: VariableType,
    shouldTrackEvent: boolean,
): string | null {
    const user = DVCPopulatedUser.fromJSONString(userStr)
    const variable = _variableForDVCUser(sdkKey, user, variableKey, variableType, shouldTrackEvent)
    return variable ? variable.stringify() : null
}

/**
 * A version of the variableForUser function that takes a preallocated string for the user and variable keys.
 * The allocated string may be larger than the real set of bytes we are about reading, so it takes a size to read until
 * @param sdkKey
 * @param userStr
 * @param userStrLength
 * @param variableKey
 * @param variableKeyLength
 * @param variableType
 */
export function variableForUserPreallocated(
    sdkKey: string,
    userStr: string,
    // pass in length of actual underlying string
    // (the userStr starts with that and may contain extra preallocated bytes)
    userStrLength: i32,
    variableKey: string,
    // ditto
    variableKeyLength: i32,
    variableType: VariableType,
    shouldTrackEvent: boolean
): string | null {
    return variableForUser(
        sdkKey,
        userStr.substr(0, userStrLength),
        variableKey.substr(0, variableKeyLength),
        variableType,
        shouldTrackEvent,
    )
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
