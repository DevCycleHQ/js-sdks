import { SDKVariable, VariableType as VariableTypeStr } from '@devcycle/types'
import { variableForUser_PB, VariableType } from './bucketingImportHelper'
import { VariableForUserParams_PB, SDKVariable_PB } from '../protobuf/compiled'
import {
    BinaryWriter,
    BinaryReader,
    BinaryWriteOptions,
    BinaryReadOptions,
    MessageType,
} from '@protobuf-ts/runtime'

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
            type: VariableTypeStr.boolean,
        }
    } else if (pbSDKVariable.type === 1) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: pbSDKVariable.doubleValue,
            type: VariableTypeStr.number,
        }
    } else if (pbSDKVariable.type === 2) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: pbSDKVariable.stringValue,
            type: VariableTypeStr.string,
        }
    } else if (pbSDKVariable.type === 3) {
        return {
            _id: pbSDKVariable._id,
            key: pbSDKVariable.key,
            value: JSON.parse(pbSDKVariable.stringValue),
            type: VariableTypeStr.json,
        }
    }
    throw new Error(`Unknown variable type: ${pbSDKVariable.type}`)
}

enum CustomDataTypePB {
    Bool,
    Num,
    Str,
    Null,
}

type CustomDataValuePB = {
    type: CustomDataTypePB
    boolValue?: boolean
    doubleValue?: number
    stringValue?: string
}

const customDataToPB = (
    customData: any,
): Record<string, CustomDataValuePB> | undefined => {
    if (!customData) return undefined

    const customDataPB: Record<string, CustomDataValuePB> = {}
    for (const [key, value] of Object.entries(customData)) {
        if (typeof value === 'boolean') {
            customDataPB[key] = {
                type: CustomDataTypePB.Bool,
                boolValue: value,
            }
        } else if (typeof value === 'number') {
            customDataPB[key] = {
                type: CustomDataTypePB.Num,
                doubleValue: value,
            }
        } else if (typeof value === 'string') {
            customDataPB[key] = {
                type: CustomDataTypePB.Str,
                stringValue: value,
            }
        } else if (value === null) {
            customDataPB[key] = { type: CustomDataTypePB.Null }
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
    variableType: VariableType
}

export function encodeProtobufMessage<T extends object>(
    message: T,
    messageType: MessageType<T>,
): Uint8Array {
    const writer = new BinaryWriter()
    const writeOptions: BinaryWriteOptions = {
        writeUnknownFields: true,
        writerFactory: () => new BinaryWriter(),
    }
    messageType.internalBinaryWrite(message, writer, writeOptions)
    return writer.finish()
}

export function decodeProtobufMessage<T extends object>(
    buffer: Uint8Array,
    messageType: MessageType<T>,
): T {
    const reader = new BinaryReader(buffer)
    const readOptions: BinaryReadOptions = {
        readUnknownField: true,
        readerFactory: () => new BinaryReader(new Uint8Array()),
    }
    return messageType.internalBinaryRead(reader, 0, readOptions)
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
    const buffer = encodeProtobufMessage(pbMsg, VariableForUserParams_PB)
    const resultBuffer = variableForUser_PB(buffer)

    return !resultBuffer
        ? null
        : pbSDKVariableToJS(decodeProtobufMessage(resultBuffer, SDKVariable_PB))
}
