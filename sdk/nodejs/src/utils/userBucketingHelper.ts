import { BucketedUserConfig, SDKVariable } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'

export function bucketUserForConfig(user: DVCPopulatedUser, token: string): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(token, JSON.stringify(user))
    ) as BucketedUserConfig
}

export function variableForUser(token: string, user: DVCPopulatedUser, variableKey: string): SDKVariable | null {
    const variableJSON = getBucketingLib().variableForUser(token, JSON.stringify(user), variableKey)
    return variableJSON ? JSON.parse(variableJSON) as SDKVariable : null
}
