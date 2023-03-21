// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.2.0
//   protoc        v3.21.12

import { Writer, Reader, Protobuf } from "as-proto/assembly";

@unmanaged
export class NullableDouble {
  static encode(message: NullableDouble, writer: Writer): void {
    writer.uint32(9);
    writer.double(message.value);

    writer.uint32(16);
    writer.bool(message.isNull);

    writer.uint32(26);
    writer.string(message.dummy);
  }

  static decode(reader: Reader, length: i32): NullableDouble {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new NullableDouble();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = reader.double();
          break;

        case 2:
          message.isNull = reader.bool();
          break;

        case 3:
          message.dummy = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  value: f64;
  isNull: bool;
  dummy: string;

  constructor(value: f64 = 0.0, isNull: bool = false, dummy: string = "") {
    this.value = value;
    this.isNull = isNull;
    this.dummy = dummy;
  }

  free(): void {
      heap.free(changetype<usize>(this.value))
  }
}

export function encodeNullableDouble(message: NullableDouble): Uint8Array {
  return Protobuf.encode(message, NullableDouble.encode);
}

export function decodeNullableDouble(buffer: Uint8Array): NullableDouble {
  return Protobuf.decode<NullableDouble>(buffer, NullableDouble.decode);
}
