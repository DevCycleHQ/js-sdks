import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'

export function bucketUserForConfig(user: DVCPopulatedUser, token: string): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(token, JSON.stringify(user))
    ) as BucketedUserConfig
}

export function getVariableTypeCode(type: VariableType): number {
    switch (type) {
        case VariableType.boolean:
            return 0 //getBucketingLib().VariableType.Boolean
        case VariableType.number:
            return 1 //getBucketingLib().VariableType.Number
        case VariableType.string:
            return 2 //getBucketingLib().VariableType.String
        case VariableType.json:
            return 3 //getBucketingLib().VariableType.JSON
        default:
            return 0
    }
}

export function variableForUser(token: string, usr: DVCPopulatedUser, key: string, type: number): SDKVariable | null {
    const bucketedVariable = getBucketingLib().variableForUser(token, JSON.stringify(usr), key, type)
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}
