/**
 * Exposes methods to unit test different functionality by parsing string arguments into complex data structures
 */

import { JSON } from 'assemblyscript-json/assembly'
import {
    BucketedUserConfig, ConfigBody, CustomDataFilter,
    DVCPopulatedUser,
    DVCUser,
    Rollout as PublicRollout,
    Target as PublicTarget,
    AudienceOperator, UserFilter,
    NoIdAudience,
    decodeVariableForUserParams_PB,
    encodeVariableForUserParams_PB,
    decodeDVCUser_PB,
    decodeSDKVariable_PB,
    encodeSDKVariable_PB,
    DVCUser_PB,
    CustomDataValue,
    DVCPopulatedUserPB
} from './types'
import {
    _doesUserPassRollout,
    _evaluateOperator,
    _generateBoundedHashes,
} from './bucketing'
import { SortingArray, sortObjectsByString } from './helpers/arrayHelpers'

export {
    testEventQueueOptionsClass,
    testDVCEventClass,
    testDVCRequestEventClass,
    testPlatformDataClass,
    testPlatformDataClassFromUTF8
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

export function evaluateOperatorFromJSON(
    operatorStr: string,
    userStr: Uint8Array,
    audiencesStr: string | null = ''
): bool {
    const operatorJSON = JSON.parse(operatorStr)
    if (!operatorJSON.isObj) {
        throw new Error('evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object')
    }
    const audiences = new Map<string, NoIdAudience>()
    if (audiencesStr !== '' && audiencesStr !== '{}') {
        const audiencesJSON = JSON.parse(audiencesStr) as JSON.Obj
        if (!audiencesJSON.isObj) {
            throw new Error('evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object')
        }
        const keys = audiencesJSON.keys
        for (let i = 0; i < keys.length; i++) {
            const aud = audiencesJSON.get(keys[i]) as JSON.Obj
            audiences.set(keys[i], new NoIdAudience(aud))
        }
    }

    const operator = new AudienceOperator(operatorJSON as JSON.Obj)
    const user_pb = decodeDVCUser_PB(userStr)
    const user = new DVCPopulatedUserPB(user_pb)
    return _evaluateOperator(operator, audiences, user, new Map<string, CustomDataValue>())
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

class TestData {
    key: string
}
export function testSortObjectsByString(arr: SortingArray<TestData>, direction: string): TestData[] {
    return sortObjectsByString<TestData>(arr, direction)
}

export function testGenerateBoundedHashesFromJSON(user_id: string, target_id: string): string {
    const boundedHash = _generateBoundedHashes(user_id, target_id)
    const json = new JSON.Obj()
    json.set('rolloutHash', boundedHash.rolloutHash)
    json.set('bucketingHash', boundedHash.bucketingHash)
    return json.stringify()
}
