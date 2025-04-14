// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.29.3

import { Writer, Reader, Protobuf } from "as-proto/assembly";
import { DVCUser_PB } from "./DVCUser_PB";
import { VariableType_PB } from "./VariableType_PB";

export class VariableForUserParams_PB {
  static encode(message: VariableForUserParams_PB, writer: Writer): void {
    writer.uint32(10);
    writer.string(message.sdkKey);

    writer.uint32(18);
    writer.string(message.variableKey);

    writer.uint32(24);
    writer.int32(message.variableType);

    const user = message.user;
    if (user !== null) {
      writer.uint32(34);
      writer.fork();
      DVCUser_PB.encode(user, writer);
      writer.ldelim();
    }

    writer.uint32(40);
    writer.bool(message.shouldTrackEvent);
  }

  static decode(reader: Reader, length: i32): VariableForUserParams_PB {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new VariableForUserParams_PB();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sdkKey = reader.string();
          break;

        case 2:
          message.variableKey = reader.string();
          break;

        case 3:
          message.variableType = reader.int32();
          break;

        case 4:
          message.user = DVCUser_PB.decode(reader, reader.uint32());
          break;

        case 5:
          message.shouldTrackEvent = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  sdkKey: string;
  variableKey: string;
  variableType: VariableType_PB;
  user: DVCUser_PB | null;
  shouldTrackEvent: bool;

  constructor(
    sdkKey: string = "",
    variableKey: string = "",
    variableType: VariableType_PB = 0,
    user: DVCUser_PB | null = null,
    shouldTrackEvent: bool = false
  ) {
    this.sdkKey = sdkKey;
    this.variableKey = variableKey;
    this.variableType = variableType;
    this.user = user;
    this.shouldTrackEvent = shouldTrackEvent;
  }
}

export function encodeVariableForUserParams_PB(
  message: VariableForUserParams_PB
): Uint8Array {
  return Protobuf.encode(message, VariableForUserParams_PB.encode);
}

export function decodeVariableForUserParams_PB(
  buffer: Uint8Array
): VariableForUserParams_PB {
  return Protobuf.decode<VariableForUserParams_PB>(
    buffer,
    VariableForUserParams_PB.decode
  );
}
