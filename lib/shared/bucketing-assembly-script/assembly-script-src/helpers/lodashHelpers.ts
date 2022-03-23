import { RegExp } from 'assemblyscript-regex'

export function find<T>(array: Array<T>, callbackfn: (value: T, index: i32, array: Array<T>) => bool): T | null {
    const index = array.findIndex(callbackfn)
    return index >= 0 ? array[index] : null
}

export function findString(array: Array<string>, findStr: string): string | null {
    for (let i = 0; i < array.length; i++) {
        const value = array[i]
        if (findStr.includes(value)) {
            return findStr
        }
    }
    return null
}

export function first<T>(array: Array<T>): T | null {
    return array.length > 0 ? array[0] : null
}

export function last<T>(array: Array<T>): T | null {
    return array.length > 0 ? array[array.length - 1] : null
}

export function includes(string: string | null, other: string): bool {
    return string ? string.includes(other) : false
}

export function replace(str: string, regex: RegExp, replaceStr: string): string {
    const result = regex.exec(str)
    const matches = (result && result.matches) ? result.matches : null
    if (!result || !matches) return str

    let replacedString = str
    for (let i = 0; i < matches.length; i++) {
        replacedString = replacedString.replace(matches[i], replaceStr)
    }
    return replacedString
}
