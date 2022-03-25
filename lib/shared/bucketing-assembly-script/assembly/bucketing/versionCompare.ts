import { RegExp } from 'assemblyscript-regex/assembly'

export class OptionsType {
    public lexicographical: bool
    public zeroExtend: bool
}

function hasValidParts(lexicographical: bool, parts: string[]): bool {
    const regex = lexicographical ? new RegExp("/^\d+[A-Za-z]*$/", "g") : new RegExp("/^\d+$/", "g")
    for (let i = 0; i < parts.length; i++) {
        if (!regex.test(parts[i])) {
            return false
        }
    }
    return !!parts.length
}

export const versionCompare = (v1: string, v2: string, options: OptionsType | null): f64 => {
    const lexicographical: bool = options ? options.lexicographical : false
    const zeroExtend: bool = options ? options.zeroExtend : false

    const v1parts = v1.split('.')
    const v2parts = v2.split('.')
    const hasV1 = hasValidParts(lexicographical, v1parts)
    const hasV2 = hasValidParts(lexicographical, v2parts)
    if (!hasV1 || !hasV2) {
        return NaN
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push('0')
        while (v2parts.length < v1parts.length) v2parts.push('0')
    }

    let v1PartsFinal: f64[] = []
    let v2PartsFinal: f64[] = []

    if (!lexicographical) {
        v1PartsFinal = v1parts.map<f64>((n) => parseInt(n))
        v2PartsFinal = v2parts.map<f64>((n) => parseInt(n))
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
