import * as $protobuf from "protobufjs";
import Long = require("long");
/** VariableType_PB enum. */
export enum VariableType_PB {
    Boolean = 0,
    Number = 1,
    String = 2,
    JSON = 3
}

/** Represents a NullableString. */
export class NullableString implements INullableString {

    /**
     * Constructs a new NullableString.
     * @param [properties] Properties to set
     */
    constructor(properties?: INullableString);

    /** NullableString value. */
    public value: string;

    /** NullableString isNull. */
    public isNull: boolean;

    /**
     * Creates a new NullableString instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NullableString instance
     */
    public static create(properties?: INullableString): NullableString;

    /**
     * Encodes the specified NullableString message. Does not implicitly {@link NullableString.verify|verify} messages.
     * @param message NullableString message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INullableString, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NullableString message, length delimited. Does not implicitly {@link NullableString.verify|verify} messages.
     * @param message NullableString message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INullableString, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NullableString message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NullableString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NullableString;

    /**
     * Decodes a NullableString message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NullableString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NullableString;

    /**
     * Verifies a NullableString message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NullableString message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NullableString
     */
    public static fromObject(object: { [k: string]: any }): NullableString;

    /**
     * Creates a plain object from a NullableString message. Also converts values to other types if specified.
     * @param message NullableString
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NullableString, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NullableString to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for NullableString
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a NullableDouble. */
export class NullableDouble implements INullableDouble {

    /**
     * Constructs a new NullableDouble.
     * @param [properties] Properties to set
     */
    constructor(properties?: INullableDouble);

    /** NullableDouble value. */
    public value: number;

    /** NullableDouble isNull. */
    public isNull: boolean;

    /**
     * Creates a new NullableDouble instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NullableDouble instance
     */
    public static create(properties?: INullableDouble): NullableDouble;

    /**
     * Encodes the specified NullableDouble message. Does not implicitly {@link NullableDouble.verify|verify} messages.
     * @param message NullableDouble message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INullableDouble, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NullableDouble message, length delimited. Does not implicitly {@link NullableDouble.verify|verify} messages.
     * @param message NullableDouble message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INullableDouble, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NullableDouble message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NullableDouble
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NullableDouble;

    /**
     * Decodes a NullableDouble message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NullableDouble
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NullableDouble;

    /**
     * Verifies a NullableDouble message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NullableDouble message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NullableDouble
     */
    public static fromObject(object: { [k: string]: any }): NullableDouble;

    /**
     * Creates a plain object from a NullableDouble message. Also converts values to other types if specified.
     * @param message NullableDouble
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NullableDouble, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NullableDouble to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for NullableDouble
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** CustomDataType enum. */
export enum CustomDataType {
    Bool = 0,
    Num = 1,
    Str = 2,
    Null = 3
}

/** Represents a CustomDataValue. */
export class CustomDataValue implements ICustomDataValue {

    /**
     * Constructs a new CustomDataValue.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICustomDataValue);

    /** CustomDataValue type. */
    public type: CustomDataType;

    /** CustomDataValue boolValue. */
    public boolValue: boolean;

    /** CustomDataValue doubleValue. */
    public doubleValue: number;

    /** CustomDataValue stringValue. */
    public stringValue: string;

    /**
     * Creates a new CustomDataValue instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CustomDataValue instance
     */
    public static create(properties?: ICustomDataValue): CustomDataValue;

    /**
     * Encodes the specified CustomDataValue message. Does not implicitly {@link CustomDataValue.verify|verify} messages.
     * @param message CustomDataValue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICustomDataValue, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CustomDataValue message, length delimited. Does not implicitly {@link CustomDataValue.verify|verify} messages.
     * @param message CustomDataValue message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICustomDataValue, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CustomDataValue message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CustomDataValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CustomDataValue;

    /**
     * Decodes a CustomDataValue message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CustomDataValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CustomDataValue;

    /**
     * Verifies a CustomDataValue message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CustomDataValue message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CustomDataValue
     */
    public static fromObject(object: { [k: string]: any }): CustomDataValue;

    /**
     * Creates a plain object from a CustomDataValue message. Also converts values to other types if specified.
     * @param message CustomDataValue
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CustomDataValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CustomDataValue to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CustomDataValue
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a NullableCustomData. */
export class NullableCustomData implements INullableCustomData {

    /**
     * Constructs a new NullableCustomData.
     * @param [properties] Properties to set
     */
    constructor(properties?: INullableCustomData);

    /** NullableCustomData value. */
    public value: { [k: string]: ICustomDataValue };

    /** NullableCustomData isNull. */
    public isNull: boolean;

    /**
     * Creates a new NullableCustomData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns NullableCustomData instance
     */
    public static create(properties?: INullableCustomData): NullableCustomData;

    /**
     * Encodes the specified NullableCustomData message. Does not implicitly {@link NullableCustomData.verify|verify} messages.
     * @param message NullableCustomData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: INullableCustomData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified NullableCustomData message, length delimited. Does not implicitly {@link NullableCustomData.verify|verify} messages.
     * @param message NullableCustomData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: INullableCustomData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a NullableCustomData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns NullableCustomData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NullableCustomData;

    /**
     * Decodes a NullableCustomData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns NullableCustomData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NullableCustomData;

    /**
     * Verifies a NullableCustomData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a NullableCustomData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns NullableCustomData
     */
    public static fromObject(object: { [k: string]: any }): NullableCustomData;

    /**
     * Creates a plain object from a NullableCustomData message. Also converts values to other types if specified.
     * @param message NullableCustomData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: NullableCustomData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this NullableCustomData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for NullableCustomData
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a VariableForUserParams_PB. */
export class VariableForUserParams_PB implements IVariableForUserParams_PB {

    /**
     * Constructs a new VariableForUserParams_PB.
     * @param [properties] Properties to set
     */
    constructor(properties?: IVariableForUserParams_PB);

    /** VariableForUserParams_PB sdkKey. */
    public sdkKey: string;

    /** VariableForUserParams_PB variableKey. */
    public variableKey: string;

    /** VariableForUserParams_PB variableType. */
    public variableType: VariableType_PB;

    /** VariableForUserParams_PB user. */
    public user?: (IDVCUser_PB|null);

    /** VariableForUserParams_PB shouldTrackEvent. */
    public shouldTrackEvent: boolean;

    /**
     * Creates a new VariableForUserParams_PB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VariableForUserParams_PB instance
     */
    public static create(properties?: IVariableForUserParams_PB): VariableForUserParams_PB;

    /**
     * Encodes the specified VariableForUserParams_PB message. Does not implicitly {@link VariableForUserParams_PB.verify|verify} messages.
     * @param message VariableForUserParams_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IVariableForUserParams_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified VariableForUserParams_PB message, length delimited. Does not implicitly {@link VariableForUserParams_PB.verify|verify} messages.
     * @param message VariableForUserParams_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IVariableForUserParams_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a VariableForUserParams_PB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns VariableForUserParams_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): VariableForUserParams_PB;

    /**
     * Decodes a VariableForUserParams_PB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns VariableForUserParams_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): VariableForUserParams_PB;

    /**
     * Verifies a VariableForUserParams_PB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a VariableForUserParams_PB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VariableForUserParams_PB
     */
    public static fromObject(object: { [k: string]: any }): VariableForUserParams_PB;

    /**
     * Creates a plain object from a VariableForUserParams_PB message. Also converts values to other types if specified.
     * @param message VariableForUserParams_PB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: VariableForUserParams_PB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this VariableForUserParams_PB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for VariableForUserParams_PB
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a DVCUser_PB. */
export class DVCUser_PB implements IDVCUser_PB {

    /**
     * Constructs a new DVCUser_PB.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDVCUser_PB);

    /** DVCUser_PB user_id. */
    public user_id: string;

    /** DVCUser_PB email. */
    public email?: (INullableString|null);

    /** DVCUser_PB name. */
    public name?: (INullableString|null);

    /** DVCUser_PB language. */
    public language?: (INullableString|null);

    /** DVCUser_PB country. */
    public country?: (INullableString|null);

    /** DVCUser_PB appBuild. */
    public appBuild?: (INullableDouble|null);

    /** DVCUser_PB appVersion. */
    public appVersion?: (INullableString|null);

    /** DVCUser_PB deviceModel. */
    public deviceModel?: (INullableString|null);

    /** DVCUser_PB customData. */
    public customData?: (INullableCustomData|null);

    /** DVCUser_PB privateCustomData. */
    public privateCustomData?: (INullableCustomData|null);

    /**
     * Creates a new DVCUser_PB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DVCUser_PB instance
     */
    public static create(properties?: IDVCUser_PB): DVCUser_PB;

    /**
     * Encodes the specified DVCUser_PB message. Does not implicitly {@link DVCUser_PB.verify|verify} messages.
     * @param message DVCUser_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDVCUser_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DVCUser_PB message, length delimited. Does not implicitly {@link DVCUser_PB.verify|verify} messages.
     * @param message DVCUser_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDVCUser_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a DVCUser_PB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DVCUser_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DVCUser_PB;

    /**
     * Decodes a DVCUser_PB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DVCUser_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DVCUser_PB;

    /**
     * Verifies a DVCUser_PB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a DVCUser_PB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DVCUser_PB
     */
    public static fromObject(object: { [k: string]: any }): DVCUser_PB;

    /**
     * Creates a plain object from a DVCUser_PB message. Also converts values to other types if specified.
     * @param message DVCUser_PB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: DVCUser_PB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this DVCUser_PB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for DVCUser_PB
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a SDKVariable_PB. */
export class SDKVariable_PB implements ISDKVariable_PB {

    /**
     * Constructs a new SDKVariable_PB.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISDKVariable_PB);

    /** SDKVariable_PB _id. */
    public _id: string;

    /** SDKVariable_PB type. */
    public type: VariableType_PB;

    /** SDKVariable_PB key. */
    public key: string;

    /** SDKVariable_PB boolValue. */
    public boolValue: boolean;

    /** SDKVariable_PB doubleValue. */
    public doubleValue: number;

    /** SDKVariable_PB stringValue. */
    public stringValue: string;

    /** SDKVariable_PB evalReason. */
    public evalReason?: (INullableString|null);

    /** SDKVariable_PB _feature. */
    public _feature?: (INullableString|null);

    /** SDKVariable_PB eval. */
    public eval?: (IEvalReason_PB|null);

    /**
     * Creates a new SDKVariable_PB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns SDKVariable_PB instance
     */
    public static create(properties?: ISDKVariable_PB): SDKVariable_PB;

    /**
     * Encodes the specified SDKVariable_PB message. Does not implicitly {@link SDKVariable_PB.verify|verify} messages.
     * @param message SDKVariable_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISDKVariable_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified SDKVariable_PB message, length delimited. Does not implicitly {@link SDKVariable_PB.verify|verify} messages.
     * @param message SDKVariable_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISDKVariable_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a SDKVariable_PB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns SDKVariable_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): SDKVariable_PB;

    /**
     * Decodes a SDKVariable_PB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns SDKVariable_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): SDKVariable_PB;

    /**
     * Verifies a SDKVariable_PB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a SDKVariable_PB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns SDKVariable_PB
     */
    public static fromObject(object: { [k: string]: any }): SDKVariable_PB;

    /**
     * Creates a plain object from a SDKVariable_PB message. Also converts values to other types if specified.
     * @param message SDKVariable_PB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: SDKVariable_PB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this SDKVariable_PB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for SDKVariable_PB
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an EvalReason_PB. */
export class EvalReason_PB implements IEvalReason_PB {

    /**
     * Constructs a new EvalReason_PB.
     * @param [properties] Properties to set
     */
    constructor(properties?: IEvalReason_PB);

    /** EvalReason_PB reason. */
    public reason: string;

    /** EvalReason_PB details. */
    public details: string;

    /** EvalReason_PB target_id. */
    public target_id: string;

    /**
     * Creates a new EvalReason_PB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EvalReason_PB instance
     */
    public static create(properties?: IEvalReason_PB): EvalReason_PB;

    /**
     * Encodes the specified EvalReason_PB message. Does not implicitly {@link EvalReason_PB.verify|verify} messages.
     * @param message EvalReason_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IEvalReason_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified EvalReason_PB message, length delimited. Does not implicitly {@link EvalReason_PB.verify|verify} messages.
     * @param message EvalReason_PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IEvalReason_PB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an EvalReason_PB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns EvalReason_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): EvalReason_PB;

    /**
     * Decodes an EvalReason_PB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns EvalReason_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): EvalReason_PB;

    /**
     * Verifies an EvalReason_PB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an EvalReason_PB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns EvalReason_PB
     */
    public static fromObject(object: { [k: string]: any }): EvalReason_PB;

    /**
     * Creates a plain object from an EvalReason_PB message. Also converts values to other types if specified.
     * @param message EvalReason_PB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: EvalReason_PB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this EvalReason_PB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for EvalReason_PB
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
