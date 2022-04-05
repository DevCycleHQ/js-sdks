import {
    _generateBoundedHashes, _generateBucketedConfig,
} from './bucketing'

import { JSON } from 'assemblyscript-json/assembly'
import { ConfigBody, DVCPopulatedUser } from './types'

export function generateBoundedHashesFromJSON(user_id: string, target_id: string): string {
    const boundedHash = _generateBoundedHashes(user_id, target_id)
    const json = new JSON.Obj()
    json.set('rolloutHash', boundedHash.rolloutHash)
    json.set('bucketingHash', boundedHash.bucketingHash)
    return json.stringify()
}

export function generateBucketedConfigFromJSON(configStr: string, userStr: string): string  {
    const config = new ConfigBody(configStr)
    const user = DVCPopulatedUser.populatedUserFromString(userStr)

    const bucketedConfig = _generateBucketedConfig(config, user)
    return bucketedConfig.stringify()
}

export * from './test'

export { murmurhashV3, murmurhashV3_js } from './helpers/murmurhash'
