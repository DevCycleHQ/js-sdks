
type optionsType = {
    lexicographical?: boolean,
    zeroExtend?: boolean
}
export const versionCompare = (v1: string, v2: string, options?: optionsType) => {
    const lexicographical = options?.lexicographical,
        zeroExtend = options?.zeroExtend

    const v1parts = v1.split('.'),
        v2parts = v2.split('.')

    const isValidPart = (x: string) => {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x)
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push('0')
        while (v2parts.length < v1parts.length) v2parts.push('0')
    }

    let v1PartsFinal: (string | number)[] = v1parts
    let v2PartsFinal: (string | number)[] = v2parts

    if (!lexicographical) {
        v1PartsFinal = v1parts.map(Number)
        v2PartsFinal = v2parts.map(Number)
    }

    for (let i = 0; i < v1PartsFinal.length; ++i) {
        if (v2PartsFinal.length === i) {
            return 1
        }

        if (v1PartsFinal[i] === v2PartsFinal[i]) {
            continue
        } else if (v1PartsFinal[i] > v2PartsFinal[i]) {
            return 1
        } else {
            return -1
        }
    }

    if (v1PartsFinal.length !== v2PartsFinal.length) {
        return -1
    }

    return 0
}
