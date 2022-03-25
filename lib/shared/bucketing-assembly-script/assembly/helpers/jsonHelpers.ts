import { JSON } from 'assemblyscript-json/assembly'

export function getJSONObjFromJSON(jsonObj: JSON.Obj, key: string): JSON.Obj {
    const obj = jsonObj.getObj(key)
    if (!obj) throw new Error(`JSON Object not found for key: "${key}", obj: ${jsonObj.stringify()}`)
    return obj
}

export function getJSONArrayFromJSON(jsonObj: JSON.Obj, key: string): JSON.Arr {
    const obj = jsonObj.getArr(key)
    if (!obj) throw new Error(`JSON Array not found for key: "${key}", obj: ${jsonObj.stringify()}`)
    return obj
}

export function getStringFromJSON(jsonObj: JSON.Obj, key: string): string {
    const str = jsonObj.getString(key)
    if (!str) {
        throw new Error(`JSON String missing for key: "${key}", obj: ${jsonObj.stringify()}`)
    } else {
        return str.valueOf()
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

export function isValidString(jsonObj: JSON.Obj, key: string, validStrings: string[]): string {
    const value = getStringFromJSON(jsonObj, key)
    if (!validStrings.includes(value)) {
        throw new Error(`Not valid string value: ${value}, for key: ${key}, obj: ${jsonObj.stringify()}`)
    }
    return value
}

export function isValidStringOptional(jsonObj: JSON.Obj, key: string, validStrings: string[]): string | null {
    const value = jsonObj.getString(key)
    if (!value) {
        return null
    }

    const str = value.toString()
    if (!validStrings.includes(str)) {
        throw new Error(`Comparator must be one of: ${validStrings.join(',')}`)
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

export function getF64FromJSON(jsonObj: JSON.Obj, key: string): f64 {
    const num = jsonObj.get(key)
    if (num && num.isFloat) {
        return (num as JSON.Float).valueOf()
    } else if (num && num.isInteger) {
        const int = num as JSON.Integer
        return f64(int.valueOf())
    } else {
        throw new Error(`JSON Number missing for key: "${key}", obj: ${jsonObj.stringify()}`)
    }
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
        throw new Error(`JSON Number missing for key: "${key}", obj: ${jsonObj.stringify()}`)
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
        throw new Error(`JSON Value missing for key: "${key}", obj: ${jsonObj.stringify()}`)
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
