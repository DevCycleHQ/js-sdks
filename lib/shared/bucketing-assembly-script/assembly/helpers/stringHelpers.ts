
function padWithLeadingZeros(str: string): string {
    const length = 5 - str.length
    const array = length > 0 ? new Array<string>(length) : []
    return array.join('0') + str
}

export function unicodeCharEscape(charCode: i32): string {
    // Ignore TS error, it builds / compiles / tests fine.
    return '\\u' + padWithLeadingZeros(charCode.toString(16))
}
