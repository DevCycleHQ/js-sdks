import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'

export function bucketUserForConfig(user: DVCPopulatedUser, token: string): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(token, JSON.stringify(user))
    ) as BucketedUserConfig
}

export function getVariableTypeCode(type: VariableType): number {
    const Bucketing = getBucketingLib()
    switch (type) {
        case VariableType.boolean:
            return Bucketing.VariableType.Boolean
        case VariableType.number:
            return Bucketing.VariableType.Number
        case VariableType.string:
            return Bucketing.VariableType.String
        case VariableType.json:
            return Bucketing.VariableType.JSON
        default:
            throw new Error(`Unknown variable type: ${type}`)
    }
}

export function variableForUser(token: string, usr: DVCPopulatedUser, key: string, type: number): SDKVariable | null {
    const bucketedVariable = getBucketingLib().variableForUser(token, JSON.stringify(usr), key, type, true)
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}
