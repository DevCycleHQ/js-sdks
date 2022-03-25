import {
    BucketedUserConfig, ConfigBody, DVCUser, DVCPopulatedUser
} from "./types"
import * as bucketing from './bucketing'
import { murmurhashV3 } from './helpers/murmurhash'

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

export function testMurmurhashV3(key: string, seed: i32): i32 {
    return murmurhashV3(key, seed)
}
