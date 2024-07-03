import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '@devcycle/js-cloud-server-sdk'
import {
    VariableForUserParams_PB,
    SDKVariable_PB,
} from '@devcycle/bucketing-assembly-script/protobuf/compiled'
import { pbSDKVariableTransform } from '../pb-types/pbTypeHelpers'
import { DVCPopulatedUserToPBUser } from '../models/populatedUserHelpers'
import { Exports } from '@devcycle/bucketing-assembly-script'

export function bucketUserForConfig(
    bucketing: Exports,
    user: DVCPopulatedUser,
    sdkKey: string,
): BucketedUserConfig {
    return JSON.parse(
        bucketing.generateBucketedConfigForUser(sdkKey, JSON.stringify(user)),
    ) as BucketedUserConfig
}

export function getSDKKeyFromConfig(
    bucketing: Exports,
    sdkKey: string,
): string | null {
    return bucketing.getSDKKeyFromConfig(sdkKey)
}

export function getVariableTypeCode(
    bucketing: Exports,
    type: VariableType,
): number {
    switch (type) {
        case VariableType.boolean:
            return bucketing.VariableType.Boolean
        case VariableType.number:
            return bucketing.VariableType.Number
        case VariableType.string:
            return bucketing.VariableType.String
        case VariableType.json:
            return bucketing.VariableType.JSON
        default:
            throw new Error(`Unknown variable type: ${type}`)
    }
}

export function variableForUser(
    bucketing: Exports,
    sdkKey: string,
    user: DVCPopulatedUser,
    key: string,
    type: number,
): SDKVariable | null {
    const bucketedVariable = bucketing.variableForUser(
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
    bucketing: Exports,
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

    const bucketedVariable = bucketing.variableForUser_PB(buffer)
    if (!bucketedVariable) return null
    return pbSDKVariableTransform(SDKVariable_PB.decode(bucketedVariable))
}
