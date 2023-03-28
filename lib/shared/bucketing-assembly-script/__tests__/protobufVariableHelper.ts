import { DVCCustomDataJSON, SDKVariable, VariableType as VariableTypeStr } from '@devcycle/types'
import {
    variableForUser_PB, VariableType
} from './bucketingImportHelper'
import {
    VariableForUserParams_PB,
    SDKVariable_PB,
    DVCUser_PB,
    NullableString,
    NullableDouble, NullableCustomData
} from '../protobuf/compiled'

type SDKVariable_PB_Type = {
    _id: string
    type: number
    key: string
    boolValue: boolean
    doubleValue: number
    stringValue: string
}

const pbSDKVariableToJS = (pbSDKVariable: SDKVariable_PB_Type): SDKVariable => {
    if (pbSDKVariable.type === 0) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: pbSDKVariable.boolValue,
            type: VariableTypeStr.boolean
        }
    } else if (pbSDKVariable.type === 1) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: pbSDKVariable.doubleValue,
            type: VariableTypeStr.number
        }
    } else if (pbSDKVariable.type === 2) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: pbSDKVariable.stringValue,
            type: VariableTypeStr.string
        }
    } else if (pbSDKVariable.type === 3) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: JSON.parse(pbSDKVariable.stringValue),
            type: VariableTypeStr.json
        }
    }
    throw new Error(`Unknown variable type: ${pbSDKVariable.type}`)
}

enum CustomDataTypePB {
    Bool,
    Num,
    Str,
    Null
}

type CustomDataValuePB = {
    type: CustomDataTypePB,
    boolValue?: boolean,
    doubleValue?: number,
    stringValue?: string
}

export const customDataToPB = (customData: Record<string, unknown>): Record<string, CustomDataValuePB> | undefined => {
    if (!customData) return undefined

    const customDataPB: Record<string, CustomDataValuePB> = {}
    for (const [key, value] of Object.entries(customData)) {
        if (typeof value === 'boolean') {
            customDataPB[key] = { type: CustomDataTypePB.Bool, boolValue: value }
        } else if (typeof value === 'number') {
            customDataPB[key] = { type: CustomDataTypePB.Num, doubleValue: value }
        } else if (typeof value === 'string') {
            customDataPB[key] = { type: CustomDataTypePB.Str, stringValue: value }
        } else if (value === null) {
            customDataPB[key] = { type: CustomDataTypePB.Null }
        } else {
            throw new Error(`Unknown custom data type: ${typeof value}`)
        }
    }
    return customDataPB
}

export type VariableForUserArgs = { sdkKey: string, user: any, variableKey: string, variableType: VariableType }

export const userToPB = (user: Record<string, unknown>): DVCUser_PB => {
    const params = {
        user_id: user.user_id,
        email: NullableString.create({ value: user.email || '', isNull: !user.email }),
        name: NullableString.create({ value: user.name || '', isNull: !user.name }),
        language: NullableString.create({ value: user.language || '', isNull: !user.language }),
        country: NullableString.create({ value: user.country || '', isNull: !user.country }),
        appBuild: NullableDouble.create({
            value: user.appBuild || 0,
            isNull: user.appBuild === null || user.appBuild === undefined
        }),
        appVersion: NullableString.create({ value: user.appVersion || '', isNull: !user.appVersion }),
        deviceModel: NullableString.create({ value: user.deviceModel, isNull: !user.deviceModel }),
        customData: NullableCustomData.create({
            value: customDataToPB(user.customData as DVCCustomDataJSON),
            isNull: !user.customData
        }),
        privateCustomData: NullableCustomData.create({
            value: customDataToPB(user.privateCustomData as DVCCustomDataJSON),
            isNull: !user.privateCustomData
        }),
    }
    const err = DVCUser_PB.verify(params)
    if (err) throw new Error(`DVCUser protobuf verification error: ${err}`)

    return DVCUser_PB.create(params)
}

const getVariableForUserParams = ({ sdkKey, user, variableKey, variableType }: VariableForUserArgs) => {
    const customData = customDataToPB(user.customData)
    const privateCustomData = customDataToPB(user.privateCustomData)
    const params = {
        sdkKey,
        variableKey,
        variableType,
        user: {
            user_id: user.user_id,
            email: user.email ? { value: user.email, isNull: false } : undefined,
            name: user.name ? { value: user.name, isNull: false } : undefined,
            language: user.language ? { value: user.language, isNull: false } : undefined,
            country: user.country ? { value: user.country, isNull: false } : undefined,
            appBuild: user.appBuild ? { value: user.appBuild, isNull: false } : undefined,
            appVersion: user.appVersion ? { value: user.appVersion, isNull: false } : undefined,
            deviceModel: user.deviceModel ? { value: user.deviceModel, isNull: false } : undefined,
            customData: customData ? { value: customData, isNull: false } : undefined,
            privateCustomData: privateCustomData ? { value: privateCustomData, isNull: false } : undefined
        },
        shouldTrackEvent: true
    }
    const err = VariableForUserParams_PB.verify(params)
    if (err) throw new Error(err)

    const pbMsg = VariableForUserParams_PB.create(params)
    return VariableForUserParams_PB.encode(pbMsg).finish()
}

export const variableForUserPB = (
    { sdkKey, user, variableKey, variableType }: VariableForUserArgs
): SDKVariable | null => {
    const buffer = getVariableForUserParams({ sdkKey, user, variableKey, variableType })
    const resultBuffer = variableForUser_PB(buffer)
    return !resultBuffer ? null : pbSDKVariableToJS(SDKVariable_PB.decode(resultBuffer))
}

export const variableForUserPBPreallocated = (
    { sdkKey, user, variableKey, variableType }: VariableForUserArgs
): SDKVariable | null => {
    const buffer = getVariableForUserParams({ sdkKey, user, variableKey, variableType })
    const preallocationJunk = new Uint8Array([1,2,3,4,45,6,7,43,3])
    const preallocated = new Uint8Array(preallocationJunk.length + buffer.length)
    preallocated.set(buffer)
    preallocated.set(preallocationJunk, buffer.length)
    const resultBuffer = variableForUser_PB(preallocated)
    return !resultBuffer ? null : pbSDKVariableToJS(SDKVariable_PB.decode(resultBuffer))
}
