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