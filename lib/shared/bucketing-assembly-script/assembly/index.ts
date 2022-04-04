import {
    BucketedUserConfig, ConfigBody, DVCUser, DVCPopulatedUser
} from "./types"
import * as bucketing from './bucketing'
export { murmurhashV3, murmurhashV3_js } from './helpers/murmurhash'
import { sortObjectsByString, SortingArray} from './helpers/arrayHelpers'

export function generateBucketedConfig(configStr: string, userStr: string): string  {
    const config = new ConfigBody(configStr)
    const user = DVCPopulatedUser.populatedUserFromString(userStr)

    const bucketedConfig = bucketing.generateBucketedConfig(config, user)
    return bucketedConfig.stringify()
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
export function testSortObjectsByString(arr: SortingArray<TestData>): TestData[]{
    return sortObjectsByString<TestData>(arr)
}
