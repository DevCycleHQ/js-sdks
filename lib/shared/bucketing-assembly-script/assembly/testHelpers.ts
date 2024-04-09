/**
 * Exposes methods to unit test different functionality by parsing string arguments into complex data structures
 */

import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    BucketedUserConfig, ConfigBody, CustomDataFilter,
    DVCPopulatedUser,
    DVCUser,
    Rollout as PublicRollout,
    Target as PublicTarget,
    AudienceOperator, UserFilter,
    decodeVariableForUserParams_PB,
    encodeVariableForUserParams_PB,
    decodeDVCUser_PB,
    decodeSDKVariable_PB,
    encodeSDKVariable_PB,
    Audience
} from './types'
import {
    _checkCustomData,
    _checkVersionFilters,
    _doesUserPassRollout,
    _evaluateOperator,
    checkNumbersFilterJSONValue
} from './bucketing'
import { SortingArray, sortObjectsByString } from './helpers/arrayHelpers'

export {
    testEventQueueOptionsClass,
    testDVCEventClass,
    testDVCRequestEventClass,
    testPlatformDataClass,
    testPlatformDataClassFromUTF8,
} from './types'

export function testVariableForUserParams_PB(buffer: Uint8Array): Uint8Array {
    const params = decodeVariableForUserParams_PB(buffer)
    return encodeVariableForUserParams_PB(params)
}

export function testDVCUser_PB(buffer: Uint8Array): Uint8Array {
    const user = DVCUser.fromPBUser(decodeDVCUser_PB(buffer))
    return user.toProtoBuf()
}

export function testSDKVariable_PB(buffer: Uint8Array): Uint8Array {
    const variable = decodeSDKVariable_PB(buffer)
    return encodeSDKVariable_PB(variable)
}

export function checkNumbersFilterFromJSON(number: string, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    const parsedNumber = JSON.parse(number)
    if (!filterJSON.isObj) throw new Error('checkNumbersFilterFromJSON filterStr param not a JSON Object')
    const filter = new UserFilter(filterJSON as JSON.Obj)
    return checkNumbersFilterJSONValue(parsedNumber, filter)
}

export function checkVersionFiltersFromJSON(appVersion: string | null, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    if (!filterJSON.isObj) throw new Error('checkVersionFiltersFromJSON filterStr param not a JSON Object')
    const filter = new UserFilter(filterJSON as JSON.Obj)
    return _checkVersionFilters(appVersion, filter)
}

export function checkCustomDataFromJSON(data: string | null, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    const dataJSON = JSON.parse(data || 'null')

    if (!filterJSON.isObj) throw new Error('checkCustomDataFromJSON filterStr param not a JSON Object')
    if (dataJSON && !dataJSON.isNull && !dataJSON.isObj) {
        throw new Error('checkCustomDataFromJSON data param not a JSON Object')
    }

    const filter = new CustomDataFilter(filterJSON as JSON.Obj)
    const dataJSONObj = dataJSON && dataJSON.isObj ? dataJSON as JSON.Obj : null
    return _checkCustomData(dataJSONObj, new JSON.Obj(), filter)
}

export function evaluateOperatorFromJSON(
    operatorStr: string,
    userStr: string,
    audiencesStr: string | null = ''
): bool {
    const operatorJSON = JSON.parse(operatorStr)
    if (!operatorJSON.isObj) {
        throw new Error('evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object')
    }
    const audiences = new Map<string, Audience>()
    if (audiencesStr !== '' && audiencesStr !== '{}') {
        const audiencesJSON = JSON.parse(audiencesStr) as JSON.Obj
        if (!audiencesJSON.isObj) {
            throw new Error('evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object')
        }
        const keys = audiencesJSON.keys
        for (let i = 0; i < keys.length; i++) {
            const aud = audiencesJSON.get(keys[i]) as JSON.Obj
            audiences.set(keys[i], new Audience(aud))
        }
    }

    const operator = new AudienceOperator(operatorJSON as JSON.Obj)
    const user = DVCPopulatedUser.fromJSONString(userStr)
    return _evaluateOperator(operator, audiences, user, new JSON.Obj())
}

export function decideTargetVariationFromJSON(targetStr: string, boundedHash: f64): string {
    const targetJSON = JSON.parse(targetStr)
    if (!targetJSON.isObj) throw new Error('decideTargetVariationFromJSON targetStr param not a JSON Object')
    const target = new PublicTarget(targetJSON as JSON.Obj)
    return target.decideTargetVariation(boundedHash)
}

export function doesUserPassRolloutFromJSON(rolloutStr: string | null, boundedHash: f64): bool {
    const rolloutJSON = rolloutStr ? JSON.parse(rolloutStr) : null
    if (rolloutJSON && !rolloutJSON.isObj) {
        throw new Error('doesUserPassRolloutFromJSON rolloutStr param not a JSON Object')
    }
    const rollout = rolloutJSON ? new PublicRollout(rolloutJSON as JSON.Obj) : null
    return _doesUserPassRollout(rollout, boundedHash)
}

export function testConfigBodyClass(configStr: string, etag: string | null = null): string {
    const config = ConfigBody.fromString(configStr, etag)
    return config.stringify()
}

export function testConfigBodyClassFromUTF8(configStr: Uint8Array, etag: string | null = null): string {
    const config = ConfigBody.fromUTF8(configStr, etag)
    return config.stringify()
}

export function testDVCUserClass(userStr: string): string {
    const user = DVCUser.fromJSONString(userStr)
    const populatedUser = new DVCPopulatedUser(user)
    return populatedUser.stringify()
}

export function testDVCUserClassFromUTF8(userStr: Uint8Array): string {
    const user = DVCUser.fromUTF8(userStr)
    const populatedUser = new DVCPopulatedUser(user)
    return populatedUser.stringify()
}

export function testBucketedUserConfigClass(userConfigStr: string): string {
    const userConfig = BucketedUserConfig.fromJSONString(userConfigStr)
    return userConfig.stringify()
}

export function echoString(str: string): string {
    return str
}

export function echoUint8Array(data: Uint8Array): Uint8Array {
    return data
}

export function triggerAbort(): void {
    throw new Error("Manual abort triggered")
}

class TestData {
    key: string
}
export function testSortObjectsByString(arr: SortingArray<TestData>, direction: string): TestData[] {
    return sortObjectsByString<TestData>(arr, direction)
}

