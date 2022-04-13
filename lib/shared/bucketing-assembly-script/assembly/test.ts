/**
 * Exposes methods to unit test different functionality by parsing string arguments into complex data structures
 */

import { JSON } from 'assemblyscript-json/assembly'
import {
    AudienceFilterOrOperator, BucketedUserConfig, ConfigBody, CustomDataFilter,
    DVCPopulatedUser,
    DVCUser,
    Rollout as PublicRollout,
    Target as PublicTarget,
    TopLevelOperator, UserFilter
} from './types'
import {
    _checkCustomData,
    _checkVersionFilters, _decideTargetVariation, _doesUserPassRollout, _evaluateOperator, checkNumbersFilterJSONValue
} from './bucketing'
import { SortingArray, sortObjectsByString } from './helpers/arrayHelpers'

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

export function evaluateOperatorFromJSON(operatorStr: string, userStr: string): bool {
    const operatorJSON = JSON.parse(operatorStr)
    if (!operatorJSON.isObj) {
        throw new Error('evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object')
    }
    const operator = new TopLevelOperator(operatorJSON as JSON.Obj)
    const user = new DVCPopulatedUser(new DVCUser(userStr))
    return _evaluateOperator(operator, user)
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
    const user = new DVCUser(userStr)
    const populatedUser = new DVCPopulatedUser(user)
    return populatedUser.stringify()
}

export function testBucketedUserConfigClass(userConfigStr: string): string {
    const userConfig = BucketedUserConfig.bucketedUserConfigFromJSONString(userConfigStr)
    return userConfig.stringify()
}

class TestData {
    key: string
}
export function testSortObjectsByString(arr: SortingArray<TestData>, direction: string): TestData[] {
    return sortObjectsByString<TestData>(arr, direction)
}
