import { JSON } from 'assemblyscript-json/assembly'
import {
    ConfigBody,
    FeatureVariation,
    PlatformData,
    SDKVariable,
    VariableForUserParams_PB,
    decodeVariableForUserParams_PB, VariableType_PB, decodeDVCUser_PB
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
import { DVCPopulatedUserPB } from './types/dvcUserPB'
import { decodeClientCustomData_PB } from './types/protobuf-generated/ClientCustomData_PB'

export function generateBoundedHashesFromJSON(user_id: string, target_id: string): string {
    const boundedHash = _generateBoundedHashes(user_id, target_id)
    const json = new JSON.Obj()
    json.set('rolloutHash', boundedHash.rolloutHash)
    json.set('bucketingHash', boundedHash.bucketingHash)
    return json.stringify()
}

export function generateBucketedConfigForUser(sdkKey: string, buffer: Uint8Array): string  {
    const user_pb = decodeDVCUser_PB(buffer)
    const config = _getConfigData(sdkKey)
    const user = new DVCPopulatedUserPB(user_pb)

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

/**
 * Convert PB VariableType to SDK VariableType
 * @param pbVariableType
 */
function variableTypeFromPB(pbVariableType: VariableType_PB): VariableType {
    switch (pbVariableType) {
        case VariableType_PB.Boolean: return VariableType.Boolean
        case VariableType_PB.Number: return VariableType.Number
        case VariableType_PB.String: return VariableType.String
        case VariableType_PB.JSON: return VariableType.JSON
        default: throw new Error(`Unknown variable type: ${pbVariableType}`)
    }
}

/**
 * Preallocated memory version of variableForUser_PB. Returns a protobuf encoded SDKVariable object.
 * @param protobuf
 * @param length
 */
export function variableForUser_PB_Preallocated(protobuf: Uint8Array, length: i32): Uint8Array | null {
    return variableForUser_PB(protobuf.slice(0, length))
}

/**
 * Protobuf version of variableForUser. Returns a protobuf encoded SDKVariable object.
 * @param protobuf Protobuf encoded VariableForUserParams_PB object
 */
export function variableForUser_PB(protobuf: Uint8Array): Uint8Array | null {
    const params: VariableForUserParams_PB = decodeVariableForUserParams_PB(protobuf)
    const user = params.user
    if (!user) throw new Error('Missing user from variableForUser_PB protobuf')
    const dvcUser = new DVCPopulatedUserPB(user)

    const variable = _variableForDVCUserPB(
        params.sdkKey,
        dvcUser,
        params.variableKey,
        variableTypeFromPB(params.variableType),
        params.shouldTrackEvent
    )
    return variable ? variable.toProtobuf() : null
}

function _variableForDVCUserPB(
    sdkKey: string,
    dvcUser: DVCPopulatedUserPB,
    variableKey: string,
    variableType: VariableType,
    shouldTrackEvent: bool
): SDKVariable | null {
    const config = _getConfigData(sdkKey)
    const response = _generateBucketedVariableForUser(config, dvcUser, variableKey, _getClientCustomData(sdkKey))

    let variable: SDKVariable | null = (response && response.variable) ? response.variable : null
    if (variable && variable.type !== VariableTypeStrings[variableType]) {
        variable = null
    }

    if (shouldTrackEvent) {
        const variableVariationMap = new Map<string, FeatureVariation>()
        if (response) {
            variableVariationMap.set(variableKey, new FeatureVariation(
                response.feature._id,
                response.variation._id
            ))
        }

        queueVariableEvaluatedEvent(sdkKey, variableVariationMap, variable, variableKey)
    }
    return variable
}

function _variableForDVCUser(
    sdkKey: string,
    dvcUser: DVCPopulatedUserPB,
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

/**
 * Set the platform data for the given SDK key.
 * @param platformDataJSONStr
 */
export function setPlatformData(platformDataJSONStr: string): void {
    const platformData = PlatformData.fromString(platformDataJSONStr)
    _setPlatformData(platformData)
}

/**
 * Same interfaces as `setPlatformData()` but with a UTF8 buffer instead of a string.
 * This is to avoid issues encoding / decoding between UTF8 and UTF16.
 * @param platformDataJSONStr
 */
export function setPlatformDataUTF8(platformDataJSONStr: Uint8Array): void {
    const platformData = PlatformData.fromUTF8(platformDataJSONStr)
    _setPlatformData(platformData)
}

/**
 * Clear the platform data for the given SDK key.
 * @param empty Add empty input string to make AS compiler work
 */
export function clearPlatformData(empty: string | null = null): void {
    _clearPlatformData()
}

/**
 * Same interfaces as `setConfigDataUTF8()` but with a preallocated buffer.
 * @param sdkKey
 * @param configDataJSONStr
 * @param length
 */
export function setConfigDataUTF8Preallocated(sdkKey: string, configDataJSONStr: Uint8Array, length: i32): void {
    setConfigDataUTF8(sdkKey, configDataJSONStr.slice(0, length))
}

/**
 * Same interfaces as `setConfigData()` but with a UTF8 buffer instead of a string.
 * This is to avoid issues encoding / decoding between UTF8 and UTF16.
 * @param sdkKey
 * @param configDataJSONStr
 */
export function setConfigDataUTF8(sdkKey: string, configDataJSONStr: Uint8Array): void {
    const configData = ConfigBody.fromUTF8(configDataJSONStr)
    _setConfigData(sdkKey, configData)
}

/**
 * Set the config data for the given SDK key and JSON String config data.
 * @param sdkKey
 * @param configDataJSONStr
 */
export function setConfigData(sdkKey: string, configDataJSONStr: string): void {
    const configData = ConfigBody.fromString(configDataJSONStr)
    _setConfigData(sdkKey, configData)
}

/**
 * Set the config data for the given SDK key and JSON String config data and etag.
 * To be used in CF workers along with `hasConfigDataForEtag()` to avoid unnecessary re-setting of config data.
 * @param sdkKey
 * @param configDataJSONStr
 * @param etag
 */
export function setConfigDataWithEtag(sdkKey: string, configDataJSONStr: string, etag: string): void {
    const configData = ConfigBody.fromString(configDataJSONStr, etag)
    _setConfigData(sdkKey, configData)
}

/**
 * Returns true if the config data for the given SDK key and the given etag.
 * @param sdkKey
 * @param etag
 */
export function hasConfigDataForEtag(sdkKey: string, etag: string): bool {
    if (!_hasConfigData(sdkKey)) return false
    const configData = _getConfigData(sdkKey)
    return configData && configData.etag !== null && configData.etag === etag
}

export function setClientCustomData(sdkKey: string, data: Uint8Array): void {
    const params = decodeClientCustomData_PB(data)
    _setClientCustomData(sdkKey, params.value)
}

export function noop(): void {
    // no-op
}

export * from './managers/eventQueueManager'

export * from './testHelpers'

export { murmurhashV3, murmurhashV3_js, murmurhashBufferSize } from './helpers/murmurhash'
