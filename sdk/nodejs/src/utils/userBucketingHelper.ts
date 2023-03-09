import {BucketedUserConfig, SDKVariable, VariableType} from '@devcycle/types'
import {DVCPopulatedUser} from '../models/populatedUser'
import {getBucketingLib, SDKVariable_PB, VariableForUserParams_PB} from '../bucketing'

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
    const bucketedVariable = getBucketingLib().variableForUser(token, JSON.stringify(usr), key, type, true)
    if (!bucketedVariable) return null
    return JSON.parse(bucketedVariable) as SDKVariable
}

type SDKVariable_PB_Type ={
    _id: string
    type: number
    key: string
    boolValue: boolean
    doubleValue: number
    stringValue: string
}

export function variableForUser_PB(
    token: string,
    usr: DVCPopulatedUser,
    key: string,
    type: number
): SDKVariable | null {
    const Bucketing = getBucketingLib()
    const params = { sdkKey: token, user: usr, variableKey: key, variableType: type, shouldTrackEvent: true }
    const err = VariableForUserParams_PB.verify(params)
    if (err) throw new Error(err)

    const pbMsg = VariableForUserParams_PB.create(params)
    const buffer = VariableForUserParams_PB.encode(pbMsg).finish()
    const response = Bucketing.variableForUser_PB(buffer)
    if (!response) return null
    const sdkVariable = SDKVariable_PB.decode(response) as unknown as SDKVariable_PB_Type
    // console.log(`sdkVariable: ${JSON.stringify(sdkVariable)}`)
    // console.log('sdkVariable.type: ' + sdkVariable.type)

    if (sdkVariable.type === 0) {
        // console.log('sdkVariable.booleanValue: ' + sdkVariable.boolValue)
        return {
            _id: sdkVariable._id,
            key: sdkVariable.key,
            value: sdkVariable.boolValue,
            type: VariableType.boolean
        }
    } else if (sdkVariable.type === 1) {
        return {
            _id: sdkVariable._id,
            key: sdkVariable.key,
            value: sdkVariable.doubleValue,
            type: VariableType.number
        }
    } else if (sdkVariable.type === 2) {
        return {
            _id: sdkVariable._id,
            key: sdkVariable.key,
            value: sdkVariable.stringValue,
            type: VariableType.string
        }
    } else if (sdkVariable.type === 3) {
        return {
            _id: sdkVariable._id,
            key: sdkVariable.key,
            value: JSON.parse(sdkVariable.stringValue),
            type: VariableType.json
        }
    }
    return null
}
