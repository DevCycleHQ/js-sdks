import { JSON } from "assemblyscript-json";

export function getJSONObjFromJSON(jsonObj: JSON.Obj, key: string): JSON.Obj {
    const obj = jsonObj.getObj(key)
    if (!obj) throw new Error(`JSON Object not found: ${key}`)
    return obj
}

export function getJSONArrayFromJSON(jsonObj: JSON.Obj, key: string): JSON.Arr {
    const obj = jsonObj.getArr(key)
    if (!obj) throw new Error(`JSON Array not found: ${key}`)
    return obj
}

export function getStringFromJSON(jsonObj: JSON.Obj, key: string): string {
    const str = jsonObj.getString(key)
    if (!str) {
        throw new Error(`JSON Object missing ${key}`)
    } else {
        return str.valueOf()
    }
}

export function isValidString(jsonObj: JSON.Obj, key: string, validStrings: string[]): string {
    const value = getStringFromJSON(jsonObj, key)
    if (!validStrings.includes(value)) {
        throw new Error(`Comparator must be one of: ${validStrings.join(',')}`)
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

export function jsonArrFromValueArray<T extends JSON.Value>(valueArr: Array<T>): JSON.Arr {
    const jsonArr = new JSON.Arr()
    for (let i = 0; i < valueArr.length; i++) {
        jsonArr.push(valueArr[i])
    }
    return jsonArr
}
