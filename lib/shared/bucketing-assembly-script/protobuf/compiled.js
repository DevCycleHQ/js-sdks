/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * VariableType_PB enum.
 * @exports VariableType_PB
 * @enum {number}
 * @property {number} Boolean=0 Boolean value
 * @property {number} Number=1 Number value
 * @property {number} String=2 String value
 * @property {number} JSON=3 JSON value
 */
$root.VariableType_PB = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Boolean"] = 0;
    values[valuesById[1] = "Number"] = 1;
    values[valuesById[2] = "String"] = 2;
    values[valuesById[3] = "JSON"] = 3;
    return values;
})();

$root.NullableString = (function() {

    /**
     * Properties of a NullableString.
     * @exports INullableString
     * @interface INullableString
     * @property {string|null} [value] NullableString value
     * @property {boolean|null} [isNull] NullableString isNull
     */

    /**
     * Constructs a new NullableString.
     * @exports NullableString
     * @classdesc Represents a NullableString.
     * @implements INullableString
     * @constructor
     * @param {INullableString=} [properties] Properties to set
     */
    function NullableString(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * NullableString value.
     * @member {string} value
     * @memberof NullableString
     * @instance
     */
    NullableString.prototype.value = "";

    /**
     * NullableString isNull.
     * @member {boolean} isNull
     * @memberof NullableString
     * @instance
     */
    NullableString.prototype.isNull = false;

    /**
     * Creates a new NullableString instance using the specified properties.
     * @function create
     * @memberof NullableString
     * @static
     * @param {INullableString=} [properties] Properties to set
     * @returns {NullableString} NullableString instance
     */
    NullableString.create = function create(properties) {
        return new NullableString(properties);
    };

    /**
     * Encodes the specified NullableString message. Does not implicitly {@link NullableString.verify|verify} messages.
     * @function encode
     * @memberof NullableString
     * @static
     * @param {INullableString} message NullableString message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableString.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
        if (message.isNull != null && Object.hasOwnProperty.call(message, "isNull"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isNull);
        return writer;
    };

    /**
     * Encodes the specified NullableString message, length delimited. Does not implicitly {@link NullableString.verify|verify} messages.
     * @function encodeDelimited
     * @memberof NullableString
     * @static
     * @param {INullableString} message NullableString message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableString.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a NullableString message from the specified reader or buffer.
     * @function decode
     * @memberof NullableString
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {NullableString} NullableString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableString.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.NullableString();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.value = reader.string();
                    break;
                }
            case 2: {
                    message.isNull = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a NullableString message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof NullableString
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {NullableString} NullableString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableString.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a NullableString message.
     * @function verify
     * @memberof NullableString
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    NullableString.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.value != null && message.hasOwnProperty("value"))
            if (!$util.isString(message.value))
                return "value: string expected";
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            if (typeof message.isNull !== "boolean")
                return "isNull: boolean expected";
        return null;
    };

    /**
     * Creates a NullableString message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof NullableString
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {NullableString} NullableString
     */
    NullableString.fromObject = function fromObject(object) {
        if (object instanceof $root.NullableString)
            return object;
        var message = new $root.NullableString();
        if (object.value != null)
            message.value = String(object.value);
        if (object.isNull != null)
            message.isNull = Boolean(object.isNull);
        return message;
    };

    /**
     * Creates a plain object from a NullableString message. Also converts values to other types if specified.
     * @function toObject
     * @memberof NullableString
     * @static
     * @param {NullableString} message NullableString
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    NullableString.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.value = "";
            object.isNull = false;
        }
        if (message.value != null && message.hasOwnProperty("value"))
            object.value = message.value;
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            object.isNull = message.isNull;
        return object;
    };

    /**
     * Converts this NullableString to JSON.
     * @function toJSON
     * @memberof NullableString
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    NullableString.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for NullableString
     * @function getTypeUrl
     * @memberof NullableString
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    NullableString.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/NullableString";
    };

    return NullableString;
})();

$root.NullableDouble = (function() {

    /**
     * Properties of a NullableDouble.
     * @exports INullableDouble
     * @interface INullableDouble
     * @property {number|null} [value] NullableDouble value
     * @property {boolean|null} [isNull] NullableDouble isNull
     * @property {string|null} [dummy] NullableDouble dummy
     */

    /**
     * Constructs a new NullableDouble.
     * @exports NullableDouble
     * @classdesc Represents a NullableDouble.
     * @implements INullableDouble
     * @constructor
     * @param {INullableDouble=} [properties] Properties to set
     */
    function NullableDouble(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * NullableDouble value.
     * @member {number} value
     * @memberof NullableDouble
     * @instance
     */
    NullableDouble.prototype.value = 0;

    /**
     * NullableDouble isNull.
     * @member {boolean} isNull
     * @memberof NullableDouble
     * @instance
     */
    NullableDouble.prototype.isNull = false;

    /**
     * NullableDouble dummy.
     * @member {string} dummy
     * @memberof NullableDouble
     * @instance
     */
    NullableDouble.prototype.dummy = "";

    /**
     * Creates a new NullableDouble instance using the specified properties.
     * @function create
     * @memberof NullableDouble
     * @static
     * @param {INullableDouble=} [properties] Properties to set
     * @returns {NullableDouble} NullableDouble instance
     */
    NullableDouble.create = function create(properties) {
        return new NullableDouble(properties);
    };

    /**
     * Encodes the specified NullableDouble message. Does not implicitly {@link NullableDouble.verify|verify} messages.
     * @function encode
     * @memberof NullableDouble
     * @static
     * @param {INullableDouble} message NullableDouble message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableDouble.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            writer.uint32(/* id 1, wireType 1 =*/9).double(message.value);
        if (message.isNull != null && Object.hasOwnProperty.call(message, "isNull"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isNull);
        if (message.dummy != null && Object.hasOwnProperty.call(message, "dummy"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.dummy);
        return writer;
    };

    /**
     * Encodes the specified NullableDouble message, length delimited. Does not implicitly {@link NullableDouble.verify|verify} messages.
     * @function encodeDelimited
     * @memberof NullableDouble
     * @static
     * @param {INullableDouble} message NullableDouble message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableDouble.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a NullableDouble message from the specified reader or buffer.
     * @function decode
     * @memberof NullableDouble
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {NullableDouble} NullableDouble
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableDouble.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.NullableDouble();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.value = reader.double();
                    break;
                }
            case 2: {
                    message.isNull = reader.bool();
                    break;
                }
            case 3: {
                    message.dummy = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a NullableDouble message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof NullableDouble
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {NullableDouble} NullableDouble
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableDouble.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a NullableDouble message.
     * @function verify
     * @memberof NullableDouble
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    NullableDouble.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.value != null && message.hasOwnProperty("value"))
            if (typeof message.value !== "number")
                return "value: number expected";
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            if (typeof message.isNull !== "boolean")
                return "isNull: boolean expected";
        if (message.dummy != null && message.hasOwnProperty("dummy"))
            if (!$util.isString(message.dummy))
                return "dummy: string expected";
        return null;
    };

    /**
     * Creates a NullableDouble message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof NullableDouble
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {NullableDouble} NullableDouble
     */
    NullableDouble.fromObject = function fromObject(object) {
        if (object instanceof $root.NullableDouble)
            return object;
        var message = new $root.NullableDouble();
        if (object.value != null)
            message.value = Number(object.value);
        if (object.isNull != null)
            message.isNull = Boolean(object.isNull);
        if (object.dummy != null)
            message.dummy = String(object.dummy);
        return message;
    };

    /**
     * Creates a plain object from a NullableDouble message. Also converts values to other types if specified.
     * @function toObject
     * @memberof NullableDouble
     * @static
     * @param {NullableDouble} message NullableDouble
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    NullableDouble.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.value = 0;
            object.isNull = false;
            object.dummy = "";
        }
        if (message.value != null && message.hasOwnProperty("value"))
            object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            object.isNull = message.isNull;
        if (message.dummy != null && message.hasOwnProperty("dummy"))
            object.dummy = message.dummy;
        return object;
    };

    /**
     * Converts this NullableDouble to JSON.
     * @function toJSON
     * @memberof NullableDouble
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    NullableDouble.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for NullableDouble
     * @function getTypeUrl
     * @memberof NullableDouble
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    NullableDouble.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/NullableDouble";
    };

    return NullableDouble;
})();

/**
 * CustomDataType enum.
 * @exports CustomDataType
 * @enum {number}
 * @property {number} Bool=0 Bool value
 * @property {number} Num=1 Num value
 * @property {number} Str=2 Str value
 * @property {number} Null=3 Null value
 */
$root.CustomDataType = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "Bool"] = 0;
    values[valuesById[1] = "Num"] = 1;
    values[valuesById[2] = "Str"] = 2;
    values[valuesById[3] = "Null"] = 3;
    return values;
})();

$root.CustomDataValue = (function() {

    /**
     * Properties of a CustomDataValue.
     * @exports ICustomDataValue
     * @interface ICustomDataValue
     * @property {CustomDataType|null} [type] CustomDataValue type
     * @property {boolean|null} [boolValue] CustomDataValue boolValue
     * @property {number|null} [doubleValue] CustomDataValue doubleValue
     * @property {string|null} [stringValue] CustomDataValue stringValue
     */

    /**
     * Constructs a new CustomDataValue.
     * @exports CustomDataValue
     * @classdesc Represents a CustomDataValue.
     * @implements ICustomDataValue
     * @constructor
     * @param {ICustomDataValue=} [properties] Properties to set
     */
    function CustomDataValue(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CustomDataValue type.
     * @member {CustomDataType} type
     * @memberof CustomDataValue
     * @instance
     */
    CustomDataValue.prototype.type = 0;

    /**
     * CustomDataValue boolValue.
     * @member {boolean} boolValue
     * @memberof CustomDataValue
     * @instance
     */
    CustomDataValue.prototype.boolValue = false;

    /**
     * CustomDataValue doubleValue.
     * @member {number} doubleValue
     * @memberof CustomDataValue
     * @instance
     */
    CustomDataValue.prototype.doubleValue = 0;

    /**
     * CustomDataValue stringValue.
     * @member {string} stringValue
     * @memberof CustomDataValue
     * @instance
     */
    CustomDataValue.prototype.stringValue = "";

    /**
     * Creates a new CustomDataValue instance using the specified properties.
     * @function create
     * @memberof CustomDataValue
     * @static
     * @param {ICustomDataValue=} [properties] Properties to set
     * @returns {CustomDataValue} CustomDataValue instance
     */
    CustomDataValue.create = function create(properties) {
        return new CustomDataValue(properties);
    };

    /**
     * Encodes the specified CustomDataValue message. Does not implicitly {@link CustomDataValue.verify|verify} messages.
     * @function encode
     * @memberof CustomDataValue
     * @static
     * @param {ICustomDataValue} message CustomDataValue message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CustomDataValue.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
        if (message.doubleValue != null && Object.hasOwnProperty.call(message, "doubleValue"))
            writer.uint32(/* id 3, wireType 1 =*/25).double(message.doubleValue);
        if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.stringValue);
        return writer;
    };

    /**
     * Encodes the specified CustomDataValue message, length delimited. Does not implicitly {@link CustomDataValue.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CustomDataValue
     * @static
     * @param {ICustomDataValue} message CustomDataValue message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CustomDataValue.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CustomDataValue message from the specified reader or buffer.
     * @function decode
     * @memberof CustomDataValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CustomDataValue} CustomDataValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CustomDataValue.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CustomDataValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.type = reader.int32();
                    break;
                }
            case 2: {
                    message.boolValue = reader.bool();
                    break;
                }
            case 3: {
                    message.doubleValue = reader.double();
                    break;
                }
            case 4: {
                    message.stringValue = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CustomDataValue message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CustomDataValue
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CustomDataValue} CustomDataValue
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CustomDataValue.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CustomDataValue message.
     * @function verify
     * @memberof CustomDataValue
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CustomDataValue.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.boolValue != null && message.hasOwnProperty("boolValue"))
            if (typeof message.boolValue !== "boolean")
                return "boolValue: boolean expected";
        if (message.doubleValue != null && message.hasOwnProperty("doubleValue"))
            if (typeof message.doubleValue !== "number")
                return "doubleValue: number expected";
        if (message.stringValue != null && message.hasOwnProperty("stringValue"))
            if (!$util.isString(message.stringValue))
                return "stringValue: string expected";
        return null;
    };

    /**
     * Creates a CustomDataValue message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CustomDataValue
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CustomDataValue} CustomDataValue
     */
    CustomDataValue.fromObject = function fromObject(object) {
        if (object instanceof $root.CustomDataValue)
            return object;
        var message = new $root.CustomDataValue();
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "Bool":
        case 0:
            message.type = 0;
            break;
        case "Num":
        case 1:
            message.type = 1;
            break;
        case "Str":
        case 2:
            message.type = 2;
            break;
        case "Null":
        case 3:
            message.type = 3;
            break;
        }
        if (object.boolValue != null)
            message.boolValue = Boolean(object.boolValue);
        if (object.doubleValue != null)
            message.doubleValue = Number(object.doubleValue);
        if (object.stringValue != null)
            message.stringValue = String(object.stringValue);
        return message;
    };

    /**
     * Creates a plain object from a CustomDataValue message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CustomDataValue
     * @static
     * @param {CustomDataValue} message CustomDataValue
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CustomDataValue.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.type = options.enums === String ? "Bool" : 0;
            object.boolValue = false;
            object.doubleValue = 0;
            object.stringValue = "";
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.CustomDataType[message.type] === undefined ? message.type : $root.CustomDataType[message.type] : message.type;
        if (message.boolValue != null && message.hasOwnProperty("boolValue"))
            object.boolValue = message.boolValue;
        if (message.doubleValue != null && message.hasOwnProperty("doubleValue"))
            object.doubleValue = options.json && !isFinite(message.doubleValue) ? String(message.doubleValue) : message.doubleValue;
        if (message.stringValue != null && message.hasOwnProperty("stringValue"))
            object.stringValue = message.stringValue;
        return object;
    };

    /**
     * Converts this CustomDataValue to JSON.
     * @function toJSON
     * @memberof CustomDataValue
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CustomDataValue.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CustomDataValue
     * @function getTypeUrl
     * @memberof CustomDataValue
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CustomDataValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CustomDataValue";
    };

    return CustomDataValue;
})();

$root.NullableCustomData = (function() {

    /**
     * Properties of a NullableCustomData.
     * @exports INullableCustomData
     * @interface INullableCustomData
     * @property {Object.<string,ICustomDataValue>|null} [value] NullableCustomData value
     * @property {boolean|null} [isNull] NullableCustomData isNull
     */

    /**
     * Constructs a new NullableCustomData.
     * @exports NullableCustomData
     * @classdesc Represents a NullableCustomData.
     * @implements INullableCustomData
     * @constructor
     * @param {INullableCustomData=} [properties] Properties to set
     */
    function NullableCustomData(properties) {
        this.value = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * NullableCustomData value.
     * @member {Object.<string,ICustomDataValue>} value
     * @memberof NullableCustomData
     * @instance
     */
    NullableCustomData.prototype.value = $util.emptyObject;

    /**
     * NullableCustomData isNull.
     * @member {boolean} isNull
     * @memberof NullableCustomData
     * @instance
     */
    NullableCustomData.prototype.isNull = false;

    /**
     * Creates a new NullableCustomData instance using the specified properties.
     * @function create
     * @memberof NullableCustomData
     * @static
     * @param {INullableCustomData=} [properties] Properties to set
     * @returns {NullableCustomData} NullableCustomData instance
     */
    NullableCustomData.create = function create(properties) {
        return new NullableCustomData(properties);
    };

    /**
     * Encodes the specified NullableCustomData message. Does not implicitly {@link NullableCustomData.verify|verify} messages.
     * @function encode
     * @memberof NullableCustomData
     * @static
     * @param {INullableCustomData} message NullableCustomData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableCustomData.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            for (var keys = Object.keys(message.value), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.CustomDataValue.encode(message.value[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        if (message.isNull != null && Object.hasOwnProperty.call(message, "isNull"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isNull);
        return writer;
    };

    /**
     * Encodes the specified NullableCustomData message, length delimited. Does not implicitly {@link NullableCustomData.verify|verify} messages.
     * @function encodeDelimited
     * @memberof NullableCustomData
     * @static
     * @param {INullableCustomData} message NullableCustomData message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    NullableCustomData.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a NullableCustomData message from the specified reader or buffer.
     * @function decode
     * @memberof NullableCustomData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {NullableCustomData} NullableCustomData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableCustomData.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.NullableCustomData(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (message.value === $util.emptyObject)
                        message.value = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.CustomDataValue.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.value[key] = value;
                    break;
                }
            case 2: {
                    message.isNull = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a NullableCustomData message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof NullableCustomData
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {NullableCustomData} NullableCustomData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    NullableCustomData.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a NullableCustomData message.
     * @function verify
     * @memberof NullableCustomData
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    NullableCustomData.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.value != null && message.hasOwnProperty("value")) {
            if (!$util.isObject(message.value))
                return "value: object expected";
            var key = Object.keys(message.value);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.CustomDataValue.verify(message.value[key[i]]);
                if (error)
                    return "value." + error;
            }
        }
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            if (typeof message.isNull !== "boolean")
                return "isNull: boolean expected";
        return null;
    };

    /**
     * Creates a NullableCustomData message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof NullableCustomData
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {NullableCustomData} NullableCustomData
     */
    NullableCustomData.fromObject = function fromObject(object) {
        if (object instanceof $root.NullableCustomData)
            return object;
        var message = new $root.NullableCustomData();
        if (object.value) {
            if (typeof object.value !== "object")
                throw TypeError(".NullableCustomData.value: object expected");
            message.value = {};
            for (var keys = Object.keys(object.value), i = 0; i < keys.length; ++i) {
                if (typeof object.value[keys[i]] !== "object")
                    throw TypeError(".NullableCustomData.value: object expected");
                message.value[keys[i]] = $root.CustomDataValue.fromObject(object.value[keys[i]]);
            }
        }
        if (object.isNull != null)
            message.isNull = Boolean(object.isNull);
        return message;
    };

    /**
     * Creates a plain object from a NullableCustomData message. Also converts values to other types if specified.
     * @function toObject
     * @memberof NullableCustomData
     * @static
     * @param {NullableCustomData} message NullableCustomData
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    NullableCustomData.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.value = {};
        if (options.defaults)
            object.isNull = false;
        var keys2;
        if (message.value && (keys2 = Object.keys(message.value)).length) {
            object.value = {};
            for (var j = 0; j < keys2.length; ++j)
                object.value[keys2[j]] = $root.CustomDataValue.toObject(message.value[keys2[j]], options);
        }
        if (message.isNull != null && message.hasOwnProperty("isNull"))
            object.isNull = message.isNull;
        return object;
    };

    /**
     * Converts this NullableCustomData to JSON.
     * @function toJSON
     * @memberof NullableCustomData
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    NullableCustomData.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for NullableCustomData
     * @function getTypeUrl
     * @memberof NullableCustomData
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    NullableCustomData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/NullableCustomData";
    };

    return NullableCustomData;
})();

$root.VariableForUserParams_PB = (function() {

    /**
     * Properties of a VariableForUserParams_PB.
     * @exports IVariableForUserParams_PB
     * @interface IVariableForUserParams_PB
     * @property {string|null} [sdkKey] VariableForUserParams_PB sdkKey
     * @property {string|null} [variableKey] VariableForUserParams_PB variableKey
     * @property {VariableType_PB|null} [variableType] VariableForUserParams_PB variableType
     * @property {IDVCUser_PB|null} [user] VariableForUserParams_PB user
     * @property {boolean|null} [shouldTrackEvent] VariableForUserParams_PB shouldTrackEvent
     */

    /**
     * Constructs a new VariableForUserParams_PB.
     * @exports VariableForUserParams_PB
     * @classdesc Represents a VariableForUserParams_PB.
     * @implements IVariableForUserParams_PB
     * @constructor
     * @param {IVariableForUserParams_PB=} [properties] Properties to set
     */
    function VariableForUserParams_PB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * VariableForUserParams_PB sdkKey.
     * @member {string} sdkKey
     * @memberof VariableForUserParams_PB
     * @instance
     */
    VariableForUserParams_PB.prototype.sdkKey = "";

    /**
     * VariableForUserParams_PB variableKey.
     * @member {string} variableKey
     * @memberof VariableForUserParams_PB
     * @instance
     */
    VariableForUserParams_PB.prototype.variableKey = "";

    /**
     * VariableForUserParams_PB variableType.
     * @member {VariableType_PB} variableType
     * @memberof VariableForUserParams_PB
     * @instance
     */
    VariableForUserParams_PB.prototype.variableType = 0;

    /**
     * VariableForUserParams_PB user.
     * @member {IDVCUser_PB|null|undefined} user
     * @memberof VariableForUserParams_PB
     * @instance
     */
    VariableForUserParams_PB.prototype.user = null;

    /**
     * VariableForUserParams_PB shouldTrackEvent.
     * @member {boolean} shouldTrackEvent
     * @memberof VariableForUserParams_PB
     * @instance
     */
    VariableForUserParams_PB.prototype.shouldTrackEvent = false;

    /**
     * Creates a new VariableForUserParams_PB instance using the specified properties.
     * @function create
     * @memberof VariableForUserParams_PB
     * @static
     * @param {IVariableForUserParams_PB=} [properties] Properties to set
     * @returns {VariableForUserParams_PB} VariableForUserParams_PB instance
     */
    VariableForUserParams_PB.create = function create(properties) {
        return new VariableForUserParams_PB(properties);
    };

    /**
     * Encodes the specified VariableForUserParams_PB message. Does not implicitly {@link VariableForUserParams_PB.verify|verify} messages.
     * @function encode
     * @memberof VariableForUserParams_PB
     * @static
     * @param {IVariableForUserParams_PB} message VariableForUserParams_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VariableForUserParams_PB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.sdkKey != null && Object.hasOwnProperty.call(message, "sdkKey"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.sdkKey);
        if (message.variableKey != null && Object.hasOwnProperty.call(message, "variableKey"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.variableKey);
        if (message.variableType != null && Object.hasOwnProperty.call(message, "variableType"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.variableType);
        if (message.user != null && Object.hasOwnProperty.call(message, "user"))
            $root.DVCUser_PB.encode(message.user, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.shouldTrackEvent != null && Object.hasOwnProperty.call(message, "shouldTrackEvent"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.shouldTrackEvent);
        return writer;
    };

    /**
     * Encodes the specified VariableForUserParams_PB message, length delimited. Does not implicitly {@link VariableForUserParams_PB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof VariableForUserParams_PB
     * @static
     * @param {IVariableForUserParams_PB} message VariableForUserParams_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VariableForUserParams_PB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a VariableForUserParams_PB message from the specified reader or buffer.
     * @function decode
     * @memberof VariableForUserParams_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {VariableForUserParams_PB} VariableForUserParams_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VariableForUserParams_PB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.VariableForUserParams_PB();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.sdkKey = reader.string();
                    break;
                }
            case 2: {
                    message.variableKey = reader.string();
                    break;
                }
            case 3: {
                    message.variableType = reader.int32();
                    break;
                }
            case 4: {
                    message.user = $root.DVCUser_PB.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.shouldTrackEvent = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a VariableForUserParams_PB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof VariableForUserParams_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {VariableForUserParams_PB} VariableForUserParams_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VariableForUserParams_PB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a VariableForUserParams_PB message.
     * @function verify
     * @memberof VariableForUserParams_PB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    VariableForUserParams_PB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.sdkKey != null && message.hasOwnProperty("sdkKey"))
            if (!$util.isString(message.sdkKey))
                return "sdkKey: string expected";
        if (message.variableKey != null && message.hasOwnProperty("variableKey"))
            if (!$util.isString(message.variableKey))
                return "variableKey: string expected";
        if (message.variableType != null && message.hasOwnProperty("variableType"))
            switch (message.variableType) {
            default:
                return "variableType: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.user != null && message.hasOwnProperty("user")) {
            var error = $root.DVCUser_PB.verify(message.user);
            if (error)
                return "user." + error;
        }
        if (message.shouldTrackEvent != null && message.hasOwnProperty("shouldTrackEvent"))
            if (typeof message.shouldTrackEvent !== "boolean")
                return "shouldTrackEvent: boolean expected";
        return null;
    };

    /**
     * Creates a VariableForUserParams_PB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof VariableForUserParams_PB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {VariableForUserParams_PB} VariableForUserParams_PB
     */
    VariableForUserParams_PB.fromObject = function fromObject(object) {
        if (object instanceof $root.VariableForUserParams_PB)
            return object;
        var message = new $root.VariableForUserParams_PB();
        if (object.sdkKey != null)
            message.sdkKey = String(object.sdkKey);
        if (object.variableKey != null)
            message.variableKey = String(object.variableKey);
        switch (object.variableType) {
        default:
            if (typeof object.variableType === "number") {
                message.variableType = object.variableType;
                break;
            }
            break;
        case "Boolean":
        case 0:
            message.variableType = 0;
            break;
        case "Number":
        case 1:
            message.variableType = 1;
            break;
        case "String":
        case 2:
            message.variableType = 2;
            break;
        case "JSON":
        case 3:
            message.variableType = 3;
            break;
        }
        if (object.user != null) {
            if (typeof object.user !== "object")
                throw TypeError(".VariableForUserParams_PB.user: object expected");
            message.user = $root.DVCUser_PB.fromObject(object.user);
        }
        if (object.shouldTrackEvent != null)
            message.shouldTrackEvent = Boolean(object.shouldTrackEvent);
        return message;
    };

    /**
     * Creates a plain object from a VariableForUserParams_PB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof VariableForUserParams_PB
     * @static
     * @param {VariableForUserParams_PB} message VariableForUserParams_PB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    VariableForUserParams_PB.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.sdkKey = "";
            object.variableKey = "";
            object.variableType = options.enums === String ? "Boolean" : 0;
            object.user = null;
            object.shouldTrackEvent = false;
        }
        if (message.sdkKey != null && message.hasOwnProperty("sdkKey"))
            object.sdkKey = message.sdkKey;
        if (message.variableKey != null && message.hasOwnProperty("variableKey"))
            object.variableKey = message.variableKey;
        if (message.variableType != null && message.hasOwnProperty("variableType"))
            object.variableType = options.enums === String ? $root.VariableType_PB[message.variableType] === undefined ? message.variableType : $root.VariableType_PB[message.variableType] : message.variableType;
        if (message.user != null && message.hasOwnProperty("user"))
            object.user = $root.DVCUser_PB.toObject(message.user, options);
        if (message.shouldTrackEvent != null && message.hasOwnProperty("shouldTrackEvent"))
            object.shouldTrackEvent = message.shouldTrackEvent;
        return object;
    };

    /**
     * Converts this VariableForUserParams_PB to JSON.
     * @function toJSON
     * @memberof VariableForUserParams_PB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    VariableForUserParams_PB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for VariableForUserParams_PB
     * @function getTypeUrl
     * @memberof VariableForUserParams_PB
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    VariableForUserParams_PB.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/VariableForUserParams_PB";
    };

    return VariableForUserParams_PB;
})();

$root.DVCUser_PB = (function() {

    /**
     * Properties of a DVCUser_PB.
     * @exports IDVCUser_PB
     * @interface IDVCUser_PB
     * @property {string|null} [user_id] DVCUser_PB user_id
     * @property {INullableString|null} [email] DVCUser_PB email
     * @property {INullableString|null} [name] DVCUser_PB name
     * @property {INullableString|null} [language] DVCUser_PB language
     * @property {INullableString|null} [country] DVCUser_PB country
     * @property {INullableDouble|null} [appBuild] DVCUser_PB appBuild
     * @property {INullableString|null} [appVersion] DVCUser_PB appVersion
     * @property {INullableString|null} [deviceModel] DVCUser_PB deviceModel
     * @property {INullableCustomData|null} [customData] DVCUser_PB customData
     * @property {INullableCustomData|null} [privateCustomData] DVCUser_PB privateCustomData
     */

    /**
     * Constructs a new DVCUser_PB.
     * @exports DVCUser_PB
     * @classdesc Represents a DVCUser_PB.
     * @implements IDVCUser_PB
     * @constructor
     * @param {IDVCUser_PB=} [properties] Properties to set
     */
    function DVCUser_PB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * DVCUser_PB user_id.
     * @member {string} user_id
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.user_id = "";

    /**
     * DVCUser_PB email.
     * @member {INullableString|null|undefined} email
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.email = null;

    /**
     * DVCUser_PB name.
     * @member {INullableString|null|undefined} name
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.name = null;

    /**
     * DVCUser_PB language.
     * @member {INullableString|null|undefined} language
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.language = null;

    /**
     * DVCUser_PB country.
     * @member {INullableString|null|undefined} country
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.country = null;

    /**
     * DVCUser_PB appBuild.
     * @member {INullableDouble|null|undefined} appBuild
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.appBuild = null;

    /**
     * DVCUser_PB appVersion.
     * @member {INullableString|null|undefined} appVersion
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.appVersion = null;

    /**
     * DVCUser_PB deviceModel.
     * @member {INullableString|null|undefined} deviceModel
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.deviceModel = null;

    /**
     * DVCUser_PB customData.
     * @member {INullableCustomData|null|undefined} customData
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.customData = null;

    /**
     * DVCUser_PB privateCustomData.
     * @member {INullableCustomData|null|undefined} privateCustomData
     * @memberof DVCUser_PB
     * @instance
     */
    DVCUser_PB.prototype.privateCustomData = null;

    /**
     * Creates a new DVCUser_PB instance using the specified properties.
     * @function create
     * @memberof DVCUser_PB
     * @static
     * @param {IDVCUser_PB=} [properties] Properties to set
     * @returns {DVCUser_PB} DVCUser_PB instance
     */
    DVCUser_PB.create = function create(properties) {
        return new DVCUser_PB(properties);
    };

    /**
     * Encodes the specified DVCUser_PB message. Does not implicitly {@link DVCUser_PB.verify|verify} messages.
     * @function encode
     * @memberof DVCUser_PB
     * @static
     * @param {IDVCUser_PB} message DVCUser_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DVCUser_PB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.user_id != null && Object.hasOwnProperty.call(message, "user_id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.user_id);
        if (message.email != null && Object.hasOwnProperty.call(message, "email"))
            $root.NullableString.encode(message.email, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            $root.NullableString.encode(message.name, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.language != null && Object.hasOwnProperty.call(message, "language"))
            $root.NullableString.encode(message.language, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.country != null && Object.hasOwnProperty.call(message, "country"))
            $root.NullableString.encode(message.country, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.appBuild != null && Object.hasOwnProperty.call(message, "appBuild"))
            $root.NullableDouble.encode(message.appBuild, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.appVersion != null && Object.hasOwnProperty.call(message, "appVersion"))
            $root.NullableString.encode(message.appVersion, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.deviceModel != null && Object.hasOwnProperty.call(message, "deviceModel"))
            $root.NullableString.encode(message.deviceModel, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
        if (message.customData != null && Object.hasOwnProperty.call(message, "customData"))
            $root.NullableCustomData.encode(message.customData, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
        if (message.privateCustomData != null && Object.hasOwnProperty.call(message, "privateCustomData"))
            $root.NullableCustomData.encode(message.privateCustomData, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified DVCUser_PB message, length delimited. Does not implicitly {@link DVCUser_PB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof DVCUser_PB
     * @static
     * @param {IDVCUser_PB} message DVCUser_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DVCUser_PB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a DVCUser_PB message from the specified reader or buffer.
     * @function decode
     * @memberof DVCUser_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {DVCUser_PB} DVCUser_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DVCUser_PB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DVCUser_PB();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.user_id = reader.string();
                    break;
                }
            case 2: {
                    message.email = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.name = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.language = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.country = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 6: {
                    message.appBuild = $root.NullableDouble.decode(reader, reader.uint32());
                    break;
                }
            case 7: {
                    message.appVersion = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.deviceModel = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            case 9: {
                    message.customData = $root.NullableCustomData.decode(reader, reader.uint32());
                    break;
                }
            case 10: {
                    message.privateCustomData = $root.NullableCustomData.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a DVCUser_PB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof DVCUser_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {DVCUser_PB} DVCUser_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DVCUser_PB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a DVCUser_PB message.
     * @function verify
     * @memberof DVCUser_PB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    DVCUser_PB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.user_id != null && message.hasOwnProperty("user_id"))
            if (!$util.isString(message.user_id))
                return "user_id: string expected";
        if (message.email != null && message.hasOwnProperty("email")) {
            var error = $root.NullableString.verify(message.email);
            if (error)
                return "email." + error;
        }
        if (message.name != null && message.hasOwnProperty("name")) {
            var error = $root.NullableString.verify(message.name);
            if (error)
                return "name." + error;
        }
        if (message.language != null && message.hasOwnProperty("language")) {
            var error = $root.NullableString.verify(message.language);
            if (error)
                return "language." + error;
        }
        if (message.country != null && message.hasOwnProperty("country")) {
            var error = $root.NullableString.verify(message.country);
            if (error)
                return "country." + error;
        }
        if (message.appBuild != null && message.hasOwnProperty("appBuild")) {
            var error = $root.NullableDouble.verify(message.appBuild);
            if (error)
                return "appBuild." + error;
        }
        if (message.appVersion != null && message.hasOwnProperty("appVersion")) {
            var error = $root.NullableString.verify(message.appVersion);
            if (error)
                return "appVersion." + error;
        }
        if (message.deviceModel != null && message.hasOwnProperty("deviceModel")) {
            var error = $root.NullableString.verify(message.deviceModel);
            if (error)
                return "deviceModel." + error;
        }
        if (message.customData != null && message.hasOwnProperty("customData")) {
            var error = $root.NullableCustomData.verify(message.customData);
            if (error)
                return "customData." + error;
        }
        if (message.privateCustomData != null && message.hasOwnProperty("privateCustomData")) {
            var error = $root.NullableCustomData.verify(message.privateCustomData);
            if (error)
                return "privateCustomData." + error;
        }
        return null;
    };

    /**
     * Creates a DVCUser_PB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof DVCUser_PB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {DVCUser_PB} DVCUser_PB
     */
    DVCUser_PB.fromObject = function fromObject(object) {
        if (object instanceof $root.DVCUser_PB)
            return object;
        var message = new $root.DVCUser_PB();
        if (object.user_id != null)
            message.user_id = String(object.user_id);
        if (object.email != null) {
            if (typeof object.email !== "object")
                throw TypeError(".DVCUser_PB.email: object expected");
            message.email = $root.NullableString.fromObject(object.email);
        }
        if (object.name != null) {
            if (typeof object.name !== "object")
                throw TypeError(".DVCUser_PB.name: object expected");
            message.name = $root.NullableString.fromObject(object.name);
        }
        if (object.language != null) {
            if (typeof object.language !== "object")
                throw TypeError(".DVCUser_PB.language: object expected");
            message.language = $root.NullableString.fromObject(object.language);
        }
        if (object.country != null) {
            if (typeof object.country !== "object")
                throw TypeError(".DVCUser_PB.country: object expected");
            message.country = $root.NullableString.fromObject(object.country);
        }
        if (object.appBuild != null) {
            if (typeof object.appBuild !== "object")
                throw TypeError(".DVCUser_PB.appBuild: object expected");
            message.appBuild = $root.NullableDouble.fromObject(object.appBuild);
        }
        if (object.appVersion != null) {
            if (typeof object.appVersion !== "object")
                throw TypeError(".DVCUser_PB.appVersion: object expected");
            message.appVersion = $root.NullableString.fromObject(object.appVersion);
        }
        if (object.deviceModel != null) {
            if (typeof object.deviceModel !== "object")
                throw TypeError(".DVCUser_PB.deviceModel: object expected");
            message.deviceModel = $root.NullableString.fromObject(object.deviceModel);
        }
        if (object.customData != null) {
            if (typeof object.customData !== "object")
                throw TypeError(".DVCUser_PB.customData: object expected");
            message.customData = $root.NullableCustomData.fromObject(object.customData);
        }
        if (object.privateCustomData != null) {
            if (typeof object.privateCustomData !== "object")
                throw TypeError(".DVCUser_PB.privateCustomData: object expected");
            message.privateCustomData = $root.NullableCustomData.fromObject(object.privateCustomData);
        }
        return message;
    };

    /**
     * Creates a plain object from a DVCUser_PB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof DVCUser_PB
     * @static
     * @param {DVCUser_PB} message DVCUser_PB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    DVCUser_PB.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.user_id = "";
            object.email = null;
            object.name = null;
            object.language = null;
            object.country = null;
            object.appBuild = null;
            object.appVersion = null;
            object.deviceModel = null;
            object.customData = null;
            object.privateCustomData = null;
        }
        if (message.user_id != null && message.hasOwnProperty("user_id"))
            object.user_id = message.user_id;
        if (message.email != null && message.hasOwnProperty("email"))
            object.email = $root.NullableString.toObject(message.email, options);
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = $root.NullableString.toObject(message.name, options);
        if (message.language != null && message.hasOwnProperty("language"))
            object.language = $root.NullableString.toObject(message.language, options);
        if (message.country != null && message.hasOwnProperty("country"))
            object.country = $root.NullableString.toObject(message.country, options);
        if (message.appBuild != null && message.hasOwnProperty("appBuild"))
            object.appBuild = $root.NullableDouble.toObject(message.appBuild, options);
        if (message.appVersion != null && message.hasOwnProperty("appVersion"))
            object.appVersion = $root.NullableString.toObject(message.appVersion, options);
        if (message.deviceModel != null && message.hasOwnProperty("deviceModel"))
            object.deviceModel = $root.NullableString.toObject(message.deviceModel, options);
        if (message.customData != null && message.hasOwnProperty("customData"))
            object.customData = $root.NullableCustomData.toObject(message.customData, options);
        if (message.privateCustomData != null && message.hasOwnProperty("privateCustomData"))
            object.privateCustomData = $root.NullableCustomData.toObject(message.privateCustomData, options);
        return object;
    };

    /**
     * Converts this DVCUser_PB to JSON.
     * @function toJSON
     * @memberof DVCUser_PB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    DVCUser_PB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for DVCUser_PB
     * @function getTypeUrl
     * @memberof DVCUser_PB
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    DVCUser_PB.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/DVCUser_PB";
    };

    return DVCUser_PB;
})();

$root.SDKVariable_PB = (function() {

    /**
     * Properties of a SDKVariable_PB.
     * @exports ISDKVariable_PB
     * @interface ISDKVariable_PB
     * @property {string|null} [_id] SDKVariable_PB _id
     * @property {VariableType_PB|null} [type] SDKVariable_PB type
     * @property {string|null} [key] SDKVariable_PB key
     * @property {boolean|null} [boolValue] SDKVariable_PB boolValue
     * @property {number|null} [doubleValue] SDKVariable_PB doubleValue
     * @property {string|null} [stringValue] SDKVariable_PB stringValue
     * @property {INullableString|null} [evalReason] SDKVariable_PB evalReason
     */

    /**
     * Constructs a new SDKVariable_PB.
     * @exports SDKVariable_PB
     * @classdesc Represents a SDKVariable_PB.
     * @implements ISDKVariable_PB
     * @constructor
     * @param {ISDKVariable_PB=} [properties] Properties to set
     */
    function SDKVariable_PB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * SDKVariable_PB _id.
     * @member {string} _id
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype._id = "";

    /**
     * SDKVariable_PB type.
     * @member {VariableType_PB} type
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.type = 0;

    /**
     * SDKVariable_PB key.
     * @member {string} key
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.key = "";

    /**
     * SDKVariable_PB boolValue.
     * @member {boolean} boolValue
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.boolValue = false;

    /**
     * SDKVariable_PB doubleValue.
     * @member {number} doubleValue
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.doubleValue = 0;

    /**
     * SDKVariable_PB stringValue.
     * @member {string} stringValue
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.stringValue = "";

    /**
     * SDKVariable_PB evalReason.
     * @member {INullableString|null|undefined} evalReason
     * @memberof SDKVariable_PB
     * @instance
     */
    SDKVariable_PB.prototype.evalReason = null;

    /**
     * Creates a new SDKVariable_PB instance using the specified properties.
     * @function create
     * @memberof SDKVariable_PB
     * @static
     * @param {ISDKVariable_PB=} [properties] Properties to set
     * @returns {SDKVariable_PB} SDKVariable_PB instance
     */
    SDKVariable_PB.create = function create(properties) {
        return new SDKVariable_PB(properties);
    };

    /**
     * Encodes the specified SDKVariable_PB message. Does not implicitly {@link SDKVariable_PB.verify|verify} messages.
     * @function encode
     * @memberof SDKVariable_PB
     * @static
     * @param {ISDKVariable_PB} message SDKVariable_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SDKVariable_PB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message._id != null && Object.hasOwnProperty.call(message, "_id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message._id);
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
        if (message.key != null && Object.hasOwnProperty.call(message, "key"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.key);
        if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.boolValue);
        if (message.doubleValue != null && Object.hasOwnProperty.call(message, "doubleValue"))
            writer.uint32(/* id 5, wireType 1 =*/41).double(message.doubleValue);
        if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.stringValue);
        if (message.evalReason != null && Object.hasOwnProperty.call(message, "evalReason"))
            $root.NullableString.encode(message.evalReason, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified SDKVariable_PB message, length delimited. Does not implicitly {@link SDKVariable_PB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof SDKVariable_PB
     * @static
     * @param {ISDKVariable_PB} message SDKVariable_PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    SDKVariable_PB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a SDKVariable_PB message from the specified reader or buffer.
     * @function decode
     * @memberof SDKVariable_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {SDKVariable_PB} SDKVariable_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SDKVariable_PB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SDKVariable_PB();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message._id = reader.string();
                    break;
                }
            case 2: {
                    message.type = reader.int32();
                    break;
                }
            case 3: {
                    message.key = reader.string();
                    break;
                }
            case 4: {
                    message.boolValue = reader.bool();
                    break;
                }
            case 5: {
                    message.doubleValue = reader.double();
                    break;
                }
            case 6: {
                    message.stringValue = reader.string();
                    break;
                }
            case 7: {
                    message.evalReason = $root.NullableString.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a SDKVariable_PB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof SDKVariable_PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {SDKVariable_PB} SDKVariable_PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    SDKVariable_PB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a SDKVariable_PB message.
     * @function verify
     * @memberof SDKVariable_PB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    SDKVariable_PB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message._id != null && message.hasOwnProperty("_id"))
            if (!$util.isString(message._id))
                return "_id: string expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
                break;
            }
        if (message.key != null && message.hasOwnProperty("key"))
            if (!$util.isString(message.key))
                return "key: string expected";
        if (message.boolValue != null && message.hasOwnProperty("boolValue"))
            if (typeof message.boolValue !== "boolean")
                return "boolValue: boolean expected";
        if (message.doubleValue != null && message.hasOwnProperty("doubleValue"))
            if (typeof message.doubleValue !== "number")
                return "doubleValue: number expected";
        if (message.stringValue != null && message.hasOwnProperty("stringValue"))
            if (!$util.isString(message.stringValue))
                return "stringValue: string expected";
        if (message.evalReason != null && message.hasOwnProperty("evalReason")) {
            var error = $root.NullableString.verify(message.evalReason);
            if (error)
                return "evalReason." + error;
        }
        return null;
    };

    /**
     * Creates a SDKVariable_PB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof SDKVariable_PB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {SDKVariable_PB} SDKVariable_PB
     */
    SDKVariable_PB.fromObject = function fromObject(object) {
        if (object instanceof $root.SDKVariable_PB)
            return object;
        var message = new $root.SDKVariable_PB();
        if (object._id != null)
            message._id = String(object._id);
        switch (object.type) {
        default:
            if (typeof object.type === "number") {
                message.type = object.type;
                break;
            }
            break;
        case "Boolean":
        case 0:
            message.type = 0;
            break;
        case "Number":
        case 1:
            message.type = 1;
            break;
        case "String":
        case 2:
            message.type = 2;
            break;
        case "JSON":
        case 3:
            message.type = 3;
            break;
        }
        if (object.key != null)
            message.key = String(object.key);
        if (object.boolValue != null)
            message.boolValue = Boolean(object.boolValue);
        if (object.doubleValue != null)
            message.doubleValue = Number(object.doubleValue);
        if (object.stringValue != null)
            message.stringValue = String(object.stringValue);
        if (object.evalReason != null) {
            if (typeof object.evalReason !== "object")
                throw TypeError(".SDKVariable_PB.evalReason: object expected");
            message.evalReason = $root.NullableString.fromObject(object.evalReason);
        }
        return message;
    };

    /**
     * Creates a plain object from a SDKVariable_PB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof SDKVariable_PB
     * @static
     * @param {SDKVariable_PB} message SDKVariable_PB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    SDKVariable_PB.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object._id = "";
            object.type = options.enums === String ? "Boolean" : 0;
            object.key = "";
            object.boolValue = false;
            object.doubleValue = 0;
            object.stringValue = "";
            object.evalReason = null;
        }
        if (message._id != null && message.hasOwnProperty("_id"))
            object._id = message._id;
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.VariableType_PB[message.type] === undefined ? message.type : $root.VariableType_PB[message.type] : message.type;
        if (message.key != null && message.hasOwnProperty("key"))
            object.key = message.key;
        if (message.boolValue != null && message.hasOwnProperty("boolValue"))
            object.boolValue = message.boolValue;
        if (message.doubleValue != null && message.hasOwnProperty("doubleValue"))
            object.doubleValue = options.json && !isFinite(message.doubleValue) ? String(message.doubleValue) : message.doubleValue;
        if (message.stringValue != null && message.hasOwnProperty("stringValue"))
            object.stringValue = message.stringValue;
        if (message.evalReason != null && message.hasOwnProperty("evalReason"))
            object.evalReason = $root.NullableString.toObject(message.evalReason, options);
        return object;
    };

    /**
     * Converts this SDKVariable_PB to JSON.
     * @function toJSON
     * @memberof SDKVariable_PB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    SDKVariable_PB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for SDKVariable_PB
     * @function getTypeUrl
     * @memberof SDKVariable_PB
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    SDKVariable_PB.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/SDKVariable_PB";
    };

    return SDKVariable_PB;
})();

module.exports = $root;
