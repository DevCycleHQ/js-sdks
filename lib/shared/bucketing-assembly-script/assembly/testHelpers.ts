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
    TopLevelOperator, UserFilter,
    Audience
} from './types'
import {
    _checkCustomData,
    _checkVersionFilters, _decideTargetVariation, _doesUserPassRollout, _evaluateOperator, checkNumbersFilterJSONValue
} from './bucketing'
import { SortingArray, sortObjectsByString } from './helpers/arrayHelpers'

export {
    testEventQueueOptionsClass,
    testDVCEventClass,
    testDVCRequestEventClass,
    testPlatformDataClass,
} from './types'

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
    return _checkCustomData(dataJSONObj, filter)
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

    const operator = new TopLevelOperator(operatorJSON as JSON.Obj)
    const user = DVCPopulatedUser.fromJSONString(userStr)
    return _evaluateOperator(operator, user, audiences)
}

export function decideTargetVariationFromJSON(targetStr: string, boundedHash: f64): string {
    const targetJSON = JSON.parse(targetStr)
    if (!targetJSON.isObj) throw new Error('decideTargetVariationFromJSON targetStr param not a JSON Object')
    const target = new PublicTarget(targetJSON as JSON.Obj)
    return _decideTargetVariation(target, boundedHash)
}

export function doesUserPassRolloutFromJSON(rolloutStr: string | null, boundedHash: f64): bool {
    const rolloutJSON = rolloutStr ? JSON.parse(rolloutStr) : null
    if (rolloutJSON && !rolloutJSON.isObj) {
        throw new Error('doesUserPassRolloutFromJSON rolloutStr param not a JSON Object')
    }
    const rollout = rolloutJSON ? new PublicRollout(rolloutJSON as JSON.Obj) : null
    return _doesUserPassRollout(rollout, boundedHash)
}

export function testConfigBodyClass(configStr: string): string {
    const config = new ConfigBody(configStr)
    return config.stringify()
}

export function testDVCUserClass(userStr: string): string {
    const user = DVCUser.fromJSONString(userStr)
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

