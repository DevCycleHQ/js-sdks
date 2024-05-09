import { JSON } from '@devcycle/assemblyscript-json/assembly'

export function getJSONObjFromJSON(jsonObj: JSON.Obj, key: string): JSON.Obj {
    const obj = jsonObj.getObj(key)
    if (!obj) throw new Error(`Object not found for key: "${key}", obj: ${jsonObj.stringify()}`)
    return obj
}

export function getBoolFromJSON(jsonObj: JSON.Obj, key: string): bool {
    const bool = jsonObj.getBool(key)
    if (!bool) {
        throw new Error(`Missing bool value for key: "${key}", obj: ${jsonObj.stringify()}`)
    } else {
        return bool.valueOf()
    }
}

export function getJSONObjFromJSONOptional(jsonObj: JSON.Obj, key: string): JSON.Obj | null {
    const obj = jsonObj.getObj(key)
    if (!obj) {
        return null
    }
    return obj
}

export function getJSONArrayFromJSON(jsonObj: JSON.Obj, key: string): JSON.Arr {
    const obj = jsonObj.getArr(key)
    if (!obj) throw new Error(`Array not found for key: "${key}", obj: ${jsonObj.stringify()}`)
    return obj
}

export function getStringFromJSON(jsonObj: JSON.Obj, key: string): string {
    const str = jsonObj.getString(key)
    if (!str) {
        throw new Error(`Missing string value for key: "${key}", obj: ${jsonObj.stringify()}`)
    } else {
        return str.valueOf()
    }
}

export function getStringArrayFromJSON(jsonObj: JSON.Obj, key: string): string[] {
    const strArray = getJSONArrayFromJSON(jsonObj, key).valueOf()
    const strings = new Array<string>()
    for (let i=0; i < strArray.length; i++) {
        const value = strArray[i]
        strings.push(value.toString())
    }
    return strings
}
export function getArrayFromJSONOptional(jsonObj: JSON.Obj, key: string): JSON.Arr | null {
    const array = jsonObj.getArr(key)
    if (array) {
        return array
    } else {
        return null
    }
}
export function getStringFromJSONOptional(jsonObj: JSON.Obj, key: string): string | null {
    const str = jsonObj.getString(key)
    if (!str) {
        return null
    } else {
        return str.valueOf()
    }
}

export function isValidString(
    jsonObj: JSON.Obj,
    key: string,
    validStrings: string[],
    shouldThrow: bool = true
): string {
    const value = getStringFromJSON(jsonObj, key)
    if (!validStrings.includes(value)) {
        if (shouldThrow) {
            throw new Error(
                `Invalid string value: ${value}, for key: ${key}, must be one of: ${validStrings.join(', ')}`
            )
        } else {
            console.log(`[DevCycle] Warning: String value: ${value}, for key: ${key} does not match a valid string.`)
        }
    }
    return value
}

export function isValidStringOptional(
    jsonObj: JSON.Obj,
    key: string,
    validStrings: string[],
    shouldThrow: bool = true
): string | null {
    const value = jsonObj.getString(key)
    if (!value) {
        return null
    }

    const str = value.toString()
    if (!validStrings.includes(str)) {
        if (shouldThrow) {
            throw new Error(`Invalid string value: ${value}, for key: ${key}`)
        } else {
            console.log(`[DevCycle] Warning: String value: ${value}, for key: ${key} does not match a valid string.`)
        }
    }
    return str
}

export function getDateFromJSON(jsonObj: JSON.Obj, key: string): Date {
    const dateStr = getStringFromJSON(jsonObj, key)
    return Date.fromString(dateStr)
}

export function getDateFromJSONOptional(jsonObj: JSON.Obj, key: string): Date | null {
    const dateStr = getStringFromJSONOptional(jsonObj, key)
    if (!dateStr) return null
    return Date.fromString(dateStr as string)
}

export function getF64FromJSONObj(jsonObj: JSON.Obj, key: string): f64 {
    const value = jsonObj.get(key)
    const num = value ? getF64FromJSONValue(value) : NaN
    if (isNaN(num)) {
        throw new Error(`Invalid number value: ${num}, for key: "${key}"`)
    }
    return num
}

export function getF64FromJSONOptional(jsonObj: JSON.Obj, key: string, defaultValue: f64): f64 {
    const num = jsonObj.get(key)
    if (!num) return defaultValue

    if (num && num.isFloat) {
        return (num as JSON.Float).valueOf()
    } else if (num && num.isInteger) {
        const int = num as JSON.Integer
        return f64(int.valueOf())
    } else {
        throw new Error(`Invalid number value: ${num}, for key: "${key}"`)
    }
}

export function jsonArrFromValueArray<T extends JSON.Value>(valueArr: Array<T>): JSON.Arr {
    const jsonArr = new JSON.Arr()
    for (let i = 0; i < valueArr.length; i++) {
        jsonArr.push(valueArr[i])
    }
    return jsonArr
}

export function jsonObjFromMap<T>(objMap: Map<string, T>): JSON.Obj {
    const jsonObj = new JSON.Obj()
    const keys = objMap.keys()

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        jsonObj.set(key, objMap.get(key))
    }
    return jsonObj
}

export function getJSONValueFromJSON(jsonObj: JSON.Obj, key: string): JSON.Value {
    const value = jsonObj.get(key)
    if (!value) {
        throw new Error(`Value missing for key: "${key}", obj: ${jsonObj.stringify()}`)
    } else {
        return value
    }
}

export function getF64FromJSONValue(jsonValue: JSON.Value): f64 {
    const float = jsonValue.isFloat ? jsonValue as JSON.Float : null
    const int = jsonValue.isInteger ? jsonValue as JSON.Integer : null
    if (!float && !int) return NaN

    return float
        ? (float as JSON.Float).valueOf()
        : (int ? f64((int as JSON.Integer).valueOf()) : NaN)
}

export function getI32FromJSONValue(jsonValue: JSON.Value): i32 {
    const int = jsonValue.isInteger ? jsonValue as JSON.Integer : null
    if (!int) {
        throw new Error(`Unable to get i32 value from JSON.Value: ${jsonValue.toString()}`)
    }

    return i32((int as JSON.Integer).valueOf())
}

export function getStringMapFromJSONObj(jsonObj: JSON.Obj): Map<string, string> {
    const stringMap = new Map<string, string>()
    for (let i = 0; i < jsonObj.keys.length; i++) {
        const key = jsonObj.keys[i]
        const jsonString = jsonObj.get(key) as JSON.Str
        stringMap.set(key, jsonString.valueOf())
    }
    return stringMap
}

export function getStringArrayMapFromJSONObj(jsonObj: JSON.Obj): Map<string, string[]> {
    const stringMap = new Map<string, string[]>()
    for (let i = 0; i < jsonObj.keys.length; i++) {
        const key = jsonObj.keys[i]
        stringMap.set(key, getStringArrayFromJSON(jsonObj, key))
    }
    return stringMap
}

export function isFlatJSONObj(json: JSON.Obj | null): bool {
    if (!json) return true

    const jsonObj = json as JSON.Obj
    const keys = jsonObj.keys
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = jsonObj.get(key)
        if (value && (value.isObj || value.isArr)) {
            return false
        }
    }
    return true
}
