import {
    BucketedUserConfig, ConfigBody, DVCUser, DVCPopulatedUser
} from "./types"
export { murmurhashV3, murmurhashV3_js } from './helpers/murmurhash'
import { sortObjectsByString, SortingArray} from './helpers/arrayHelpers'

import {
    generateBoundedHashesFromJSON,
    decideTargetVariationFromJSON,
    generateBucketedConfigFromJSON,
    doesUserPassRolloutFromJSON,
    evaluateOperatorFromJSON,
    checkStringsFilterFromJSON,
    checkBooleanFilterFromJSON,
    checkNumbersFilterFromJSON,
    checkNumberFilterFromJSON,
    checkVersionFiltersFromJSON,
    checkVersionFilter,
    checkCustomDataFromJSON
} from './bucketing'

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
export function testSortObjectsByString(arr: SortingArray<TestData>): TestData[] {
    return sortObjectsByString<TestData>(arr)
}
export {
    generateBoundedHashesFromJSON,
    decideTargetVariationFromJSON,
    generateBucketedConfigFromJSON,
    doesUserPassRolloutFromJSON,
    evaluateOperatorFromJSON,
    checkStringsFilterFromJSON,
    checkBooleanFilterFromJSON,
    checkNumbersFilterFromJSON,
    checkNumberFilterFromJSON,
    checkVersionFiltersFromJSON,
    checkVersionFilter,
    checkCustomDataFromJSON
}
