import { SDKVariable, VariableType as VariableTypeStr } from '@devcycle/types'
import { variableForUser_PB } from './bucketingImportHelper'
import {
    VariableForUserParams_PB,
    SDKVariable_PB,
    VariableType_PB,
    CustomDataValue,
    CustomDataType,
} from '../protobuf/compiled'

const pbSDKVariableToJS = (pbSDKVariable: SDKVariable_PB): SDKVariable => {
    let sdkVariableType: VariableTypeStr
    let value: any

    switch (pbSDKVariable.type) {
        case VariableType_PB.Boolean:
            sdkVariableType = VariableTypeStr.boolean
            value = pbSDKVariable.boolValue
            break
        case VariableType_PB.Number:
            sdkVariableType = VariableTypeStr.number
            value = pbSDKVariable.doubleValue
            break
        case VariableType_PB.String:
            sdkVariableType = VariableTypeStr.string
            value = pbSDKVariable.stringValue
            break
        case VariableType_PB.JSON:
            sdkVariableType = VariableTypeStr.json
            value = JSON.parse(pbSDKVariable.stringValue)
            break
        default:
            throw new Error(`Unknown variable type: ${pbSDKVariable.type}`)
    }

    return {
        _id: pbSDKVariable._id,
        key: pbSDKVariable.key,
        value,
        type: sdkVariableType,
    }
}

const customDataToPB = (
    customData: any,
): Record<string, CustomDataValue> | undefined => {
    if (!customData) return undefined

    const customDataPB: Record<string, CustomDataValue> = {}
    for (const [key, value] of Object.entries(customData)) {
        if (typeof value === 'boolean') {
            customDataPB[key] = {
                type: CustomDataType.Bool,
                boolValue: value,
            }
        } else if (typeof value === 'number') {
            customDataPB[key] = {
                type: CustomDataType.Num,
                doubleValue: value,
            }
        } else if (typeof value === 'string') {
            customDataPB[key] = {
                type: CustomDataType.Str,
                stringValue: value,
            }
        } else if (value === null) {
            customDataPB[key] = { type: CustomDataType.Null }
        } else {
            throw new Error(`Unknown custom data type: ${typeof value}`)
        }
    }
    return customDataPB
}

export type VariableForUserArgs = {
    sdkKey: string
    user: any
    variableKey: string
    variableType: VariableType_PB
}

export const variableForUserPB = ({
    sdkKey,
    user,
    variableKey,
    variableType,
}: VariableForUserArgs): SDKVariable | null => {
    const customData = customDataToPB(user.customData)
    const privateCustomData = customDataToPB(user.privateCustomData)
    const params = {
        sdkKey,
        variableKey,
        variableType,
        user: {
            user_id: user.user_id,
            email: user.email
                ? { value: user.email, isNull: false }
                : undefined,
            name: user.name ? { value: user.name, isNull: false } : undefined,
            language: user.language
                ? { value: user.language, isNull: false }
                : undefined,
            country: user.country
                ? { value: user.country, isNull: false }
                : undefined,
            appBuild: user.appBuild
                ? { value: user.appBuild, isNull: false }
                : undefined,
            appVersion: user.appVersion
                ? { value: user.appVersion, isNull: false }
                : undefined,
            deviceModel: user.deviceModel
                ? { value: user.deviceModel, isNull: false }
                : undefined,
            customData: customData
                ? { value: customData, isNull: false }
                : undefined,
            privateCustomData: privateCustomData
                ? { value: privateCustomData, isNull: false }
                : undefined,
        },
        shouldTrackEvent: true,
    }

    const pbMsg = VariableForUserParams_PB.create(params)
    const buffer = VariableForUserParams_PB.toBinary(pbMsg)

    const resultBuffer = variableForUser_PB(buffer)
    return !resultBuffer
        ? null
        : pbSDKVariableToJS(SDKVariable_PB.fromBinary(resultBuffer))
}
