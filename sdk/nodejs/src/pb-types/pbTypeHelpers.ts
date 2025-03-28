import { SDKVariable, VariableType, VariableValue } from '@devcycle/types'
import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'
import {
    BinaryWriter,
    BinaryReader,
    BinaryWriteOptions,
    BinaryReadOptions,
    MessageType,
} from '@protobuf-ts/runtime'

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

type GetVariableType = {
    type: VariableType
    value: VariableValue
}
function getVariableTypeFromPB(
    variable: ProtobufTypes.SDKVariable_PB,
): GetVariableType {
    switch (variable.type) {
        case ProtobufTypes.VariableType_PB.Boolean:
            return {
                type: VariableType.boolean,
                value: variable.boolValue,
            }
        case ProtobufTypes.VariableType_PB.Number:
            return {
                type: VariableType.number,
                value: variable.doubleValue,
            }
        case ProtobufTypes.VariableType_PB.String:
            return {
                type: VariableType.string,
                value: variable.stringValue,
            }
        case ProtobufTypes.VariableType_PB.JSON:
            return {
                type: VariableType.json,
                value: JSON.parse(variable.stringValue),
            }
        default:
            throw new Error(`Unknown variable type: ${variable.type}`)
    }
}

export function pbSDKVariableTransform(
    variable: ProtobufTypes.SDKVariable_PB,
): SDKVariable {
    const { type, value } = getVariableTypeFromPB(variable)

    return {
        _id: variable.Id,
        type,
        key: variable.key,
        value,
        evalReason:
            !variable.evalReason || variable.evalReason.isNull
                ? null
                : variable.evalReason,
    }
}
