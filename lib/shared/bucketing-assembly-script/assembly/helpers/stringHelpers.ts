
function padWithLeadingZeros(str: string): string {
    const length = 5 - str.length
    const array = length > 0 ? new Array<string>(length) : []
    return array.join('0') + str
}

function unicodeCharEscape(charCode: i32): string {
    // Ignore TS error, it builds / compiles / tests fine.
    return '\\u' + padWithLeadingZeros(charCode.toString(16))
}

function stringIsAscii(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127) {
            return false
        }
    }
    return true
}

export function unicodeEscape(str: string): string {
    if (stringIsAscii(str)) {
        return str
    }

    return str.split('')
        .map<string>((char) => {
            const charCode: i32 = char.charCodeAt(0)
            return charCode > 127 ? unicodeCharEscape(charCode) : char
        })
        .join('')
}
