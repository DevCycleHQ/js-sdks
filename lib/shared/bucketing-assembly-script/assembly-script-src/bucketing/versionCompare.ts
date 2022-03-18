import { RegExp } from 'assemblyscript-regex'

interface optionsType {
    lexicographical: bool,
    zeroExtend: bool
}

function isValidPart(lexicographical: bool, x: string): bool {
    const regex = lexicographical ? new RegExp("/^\d+[A-Za-z]*$/", "g") : new RegExp("/^\d+$/", "g")
    return regex.test(x)
}

export const versionCompare = (v1: string, v2: string, options: optionsType | null): i32 => {
    const lexicographical: bool = options ? options.lexicographical : false
    const zeroExtend: bool = options ? options.zeroExtend : false

    const v1parts = v1.split('.')
    const v2parts = v2.split('.')
    const hasV1 = v1parts.every((v1) => isValidPart(lexicographical, v1))
    const hasV2 = v2parts.every((v2) => isValidPart(lexicographical, v2))
    if (!hasV1 || !hasV2) {
        return NaN
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push('0')
        while (v2parts.length < v1parts.length) v2parts.push('0')
    }

    let v1PartsFinal: i32[] = []
    let v2PartsFinal: i32[] = []

    if (!lexicographical) {
        v1PartsFinal = v1parts.map((n) => i32(n))
        v2PartsFinal = v2parts.map((n) => i32(n))
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
