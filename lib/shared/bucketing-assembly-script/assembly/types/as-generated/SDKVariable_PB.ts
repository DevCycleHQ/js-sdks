// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.2.0
//   protoc        v3.21.12

import { Writer, Reader, Protobuf } from 'as-proto/assembly'
import { NullableString } from './NullableString'
import { VariableType_PB } from './VariableType_PB'

export class SDKVariable_PB {
    static encode(message: SDKVariable_PB, writer: Writer): void {
        writer.uint32(10)
        writer.string(message.id)

        writer.uint32(16)
        writer.int32(message.type)

        writer.uint32(26)
        writer.string(message.key)

        writer.uint32(32)
        writer.bool(message.boolValue)

        writer.uint32(41)
        writer.double(message.doubleValue)

        writer.uint32(50)
        writer.string(message.stringValue)

        const evalReason = message.evalReason
        if (evalReason !== null) {
            writer.uint32(58)
            writer.fork()
            NullableString.encode(evalReason, writer)
            writer.ldelim()
        }
    }

    static decode(reader: Reader, length: i32): SDKVariable_PB {
        const end: usize = length < 0 ? reader.end : reader.ptr + length
        const message = new SDKVariable_PB()

        while (reader.ptr < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string()
                    break

                case 2:
                    message.type = reader.int32()
                    break

                case 3:
                    message.key = reader.string()
                    break

                case 4:
                    message.boolValue = reader.bool()
                    break

                case 5:
                    message.doubleValue = reader.double()
                    break

                case 6:
                    message.stringValue = reader.string()
                    break

                case 7:
                    message.evalReason = NullableString.decode(reader, reader.uint32())
                    break

                default:
                    reader.skipType(tag & 7)
                    break
            }
        }

        return message
    }

    id: string
    type: VariableType_PB
    key: string
    boolValue: bool
    doubleValue: f64
    stringValue: string
    evalReason: NullableString | null

    constructor(
        id = '',
        type: VariableType_PB = 0,
        key = '',
        boolValue: bool = false,
        doubleValue: f64 = 0.0,
        stringValue = '',
        evalReason: NullableString | null = null
    ) {
        this.id = id
        this.type = type
        this.key = key
        this.boolValue = boolValue
        this.doubleValue = doubleValue
        this.stringValue = stringValue
        this.evalReason = evalReason
    }
}

export function encodeSDKVariable_PB(message: SDKVariable_PB): Uint8Array {
    return Protobuf.encode(message, SDKVariable_PB.encode)
}

export function decodeSDKVariable_PB(buffer: Uint8Array): SDKVariable_PB {
    return Protobuf.decode<SDKVariable_PB>(buffer, SDKVariable_PB.decode)
}
