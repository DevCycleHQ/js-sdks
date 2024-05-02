import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '@devcycle/js-cloud-server-sdk'
import { getBucketingLib } from '../bucketing'
import {
    VariableForUserParams_PB,
    SDKVariable_PB,
} from '@devcycle/bucketing-assembly-script/protobuf/compiled'
import { pbSDKVariableTransform } from '../pb-types/pbTypeHelpers'
import { DVCPopulatedUserToPBUser } from '../models/populatedUserHelpers'

export function bucketUserForConfig(
    user: DVCPopulatedUser,
    sdkKey: string,
): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(
            sdkKey,
            JSON.stringify(user),
        ),
    ) as BucketedUserConfig
}

export function getSDKKeyFromConfig(sdkKey: string): string | null {
    return getBucketingLib().getSDKKeyFromConfig(sdkKey)
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
    user: DVCPopulatedUser,
    key: string,
    type: number,
): SDKVariable | null {
    const bucketedVariable = getBucketingLib().variableForUser(
        sdkKey,
        JSON.stringify(user),
        key,
        type,
        true,
    )
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}

export function variableForUser_PB(
    sdkKey: string,
    user: DVCPopulatedUser,
    key: string,
    type: number,
): SDKVariable | null {
    const params = {
        sdkKey,
        user: DVCPopulatedUserToPBUser(user),
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
