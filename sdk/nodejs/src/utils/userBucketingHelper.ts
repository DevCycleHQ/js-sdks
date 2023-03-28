import { BucketedUserConfig, SDKVariable, VariableType } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'
import {
    VariableForUserParams_PB, SDKVariable_PB, DVCUser_PB
} from '@devcycle/bucketing-assembly-script/protobuf/compiled'
import { pbSDKVariableTransform } from '../pb-types/pbTypeHelpers'

export function userToPB(user: DVCPopulatedUser): Uint8Array {
    const pbUser = user.toPBUser()
    const err = DVCUser_PB.verify(pbUser)
    if (err) throw new Error(`Invalid DVCUser_PB protobuf params: ${err}`)
    return DVCUser_PB.encode(pbUser).finish()
}

export function bucketUserForConfig(user: DVCPopulatedUser, sdkKey: string): BucketedUserConfig {
    const buffer = userToPB(user)
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(sdkKey, buffer)
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

export function variableForUser_PB(
    sdkKey: string, usr: DVCPopulatedUser, key: string, type: number
): SDKVariable | null {
    const params = {
        sdkKey,
        user: usr.toPBUser(),
        variableKey: key,
        variableType: type,
        shouldTrackEvent: true
    }
    const err = VariableForUserParams_PB.verify(params)
    if (err) throw new Error(`Invalid VariableForUserParams_PB protobuf params: ${err}`)

    const buffer = VariableForUserParams_PB.encode(params).finish()

    const bucketedVariable = getBucketingLib().variableForUser_PB(buffer)
    if (!bucketedVariable) return null
    return pbSDKVariableTransform(SDKVariable_PB.decode(bucketedVariable))
}
