import { JSON } from "assemblyscript-json"
import { BucketedUserConfig, ConfigBody } from "./types"
import {DVCUser} from "./types/dvcUser";

export function generateBucketedConfig(configStr: string, userStr: string): string  {
    const config = new ConfigBody(configStr)

    const user: JSON.Obj = <JSON.Obj>(JSON.parse(userStr))

    // const bucketedConfig = new BucketedUserConfig(config)
    return config.stringify()
}

export function testConfigBodyClass(configStr: string): string {
    const config = new ConfigBody(configStr)
    return config.stringify()
}

export function testDVCUserClass(userStr: string): string {
    const user = DVCUser.dvcUserFromJSONString(userStr)
    return user.stringify()
}

export function testBucketedUserConfigClass(userConfigStr: string): string {
    const userConfig = BucketedUserConfig.bucketedUserConfigFromJSONString(userConfigStr)
    return userConfig.stringify()
}
