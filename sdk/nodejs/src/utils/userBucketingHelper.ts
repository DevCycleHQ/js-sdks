import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'

export function bucketUserForConfig(user: DVCPopulatedUser, token: string): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(token, JSON.stringify(user))
    ) as BucketedUserConfig
}

export function getVariableTypeCode(type: VariableType): number {
    // TODO: can't figure out how to get the enum values from the bucketing lib as its dynamically imported
    // const Bucketing = getBucketingLib()
    switch (type) {
        case VariableType.boolean:
            return 0 //Bucketing.VariableType.Boolean
        case VariableType.number:
            return 1 //Bucketing.VariableType.Number
        case VariableType.string:
            return 2 //Bucketing.VariableType.String
        case VariableType.json:
            return 3 //Bucketing.VariableType.JSON
        default:
            throw new Error(`Unknown variable type: ${type}`)
    }
}

export function variableForUser(token: string, usr: DVCPopulatedUser, key: string, type: number): SDKVariable | null {
    const bucketedVariable = getBucketingLib().variableForUser(token, JSON.stringify(usr), key, type, true)
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}
