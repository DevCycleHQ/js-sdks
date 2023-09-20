import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedPBUser } from '../models/populatedPBUser'
import { getBucketingLib } from '../bucketing'
import {
    VariableForUserParams_PB,
    SDKVariable_PB,
} from '@devcycle/bucketing-assembly-script/protobuf/compiled'
import { pbSDKVariableTransform } from '../pb-types/pbTypeHelpers'

export function bucketUserForConfig(
    user: DVCPopulatedPBUser,
    sdkKey: string,
): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(
            sdkKey,
            JSON.stringify(user),
        ),
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

export function variableForUser(
    sdkKey: string,
    usr: DVCPopulatedPBUser,
    key: string,
    type: number,
): SDKVariable | null {
    const bucketedVariable = getBucketingLib().variableForUser(
        sdkKey,
        JSON.stringify(usr),
        key,
        type,
        true,
    )
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}

export function variableForUser_PB(
    sdkKey: string,
    usr: DVCPopulatedPBUser,
    key: string,
    type: number,
): SDKVariable | null {
    const params = {
        sdkKey,
        user: usr.toPBUser(),
        variableKey: key,
        variableType: type,
        shouldTrackEvent: true,
    }
    const err = VariableForUserParams_PB.verify(params)
    if (err)
        throw new Error(
            `Invalid VariableForUserParams_PB protobuf params: ${err}`,
        )

    const buffer = VariableForUserParams_PB.encode(params).finish()

    const bucketedVariable = getBucketingLib().variableForUser_PB(buffer)
    if (!bucketedVariable) return null
    return pbSDKVariableTransform(SDKVariable_PB.decode(bucketedVariable))
}
