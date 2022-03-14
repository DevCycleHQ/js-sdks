import { JSON } from "assemblyscript-json"
import { BucketedUserConfig, ConfigBody } from "./types"

export function generateBucketedConfig(configStr: string, userStr: string): string  {
    const configJSON = JSON.parse(configStr)
    if (!configJSON.isObj) throw new Error(`generateBucketedConfig config param not a JSON Object`)
    const config = new ConfigBody(configJSON as JSON.Obj)

    const user: JSON.Obj = <JSON.Obj>(JSON.parse(userStr))

    // const bucketedConfig = new BucketedUserConfig(config)
    return config.stringify()
}
