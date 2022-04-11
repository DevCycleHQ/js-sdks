import {
    _generateBoundedHashes, _generateBucketedConfig,
} from './bucketing'

import { JSON } from 'assemblyscript-json/assembly'
import { ConfigBody, DVCPopulatedUser, PlatformData } from './types'
import { _setPlatformData } from './managers/platformDataManager'
import { _getConfigData, _setConfigData } from './managers/configDataManager'

export function generateBoundedHashesFromJSON(user_id: string, target_id: string): string {
    const boundedHash = _generateBoundedHashes(user_id, target_id)
    const json = new JSON.Obj()
    json.set('rolloutHash', boundedHash.rolloutHash)
    json.set('bucketingHash', boundedHash.bucketingHash)
    return json.stringify()
}

export function generateBucketedConfigForUser(token: string, userStr: string): string  {
    const config = _getConfigData(token)
    const user = DVCPopulatedUser.populatedUserFromString(userStr)

    const bucketedConfig = _generateBucketedConfig(config, user)
    return bucketedConfig.stringify()
}

export function setPlatformData(platformDataStr: string): void {
    const platformData = new PlatformData(platformDataStr)
    _setPlatformData(platformData)
}

export function setConfigData(token: string, configDataStr: string): void {
    const configData = new ConfigBody(configDataStr)
    _setConfigData(token, configData)
}

export * from './test'

export { murmurhashV3, murmurhashV3_js } from './helpers/murmurhash'
