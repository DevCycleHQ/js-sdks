import { RegExp } from 'assemblyscript-regex'
import { find, includes, replace } from '../helpers/lodashHelpers'
import { versionCompare } from './versionCompare'
import {
    TopLevelOperator, AudienceFilterOrOperator, DVCPopulatedUser, validSubTypes
} from '../types'
import {JSON} from "assemblyscript-json";
import {getF64FromJSONValue} from "../helpers/jsonHelpers";
// import UAParser from 'ua-parser-js'

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param data - The incoming user, device, and user agent data
 */
export const evaluateOperator = (operator: TopLevelOperator, data: DVCPopulatedUser): bool => {
    if (!operator.filters.length) return false

    const doesUserPassFilter = (filter: AudienceFilterOrOperator) => {
        if (filter.type === 'all') return true
        if (!filter.subType || !validSubTypes.includes(filter.subType)) {
            throw new Error(`Invalid filter subType: ${filter.subType}`)
        }
        return filterFunctionsBySubtype(filter.subType, data, filter)
    }

    if (operator.operator === 'or') {
        return operator.filters.some(doesUserPassFilter)
    } else {
        return operator.filters.every(doesUserPassFilter)
    }
}

const filterFunctionsBySubtype = (subType: string, user: DVCPopulatedUser, filter: AudienceFilterOrOperator): bool => {
    switch (subType) {
        case 'country':
            return checkStringsFilter(user.country, filter)
        case 'email':
            return checkStringsFilter(user.email, filter)
        case 'user_id':
            return checkStringsFilter(user.user_id, filter)
        case 'appVersion':
            return checkVersionFilters(user.appVersion, filter)
        case 'platformVersion':
            return checkVersionFilters(user.platformVersion, filter)
        case 'deviceModel':
            return checkStringsFilter(user.deviceModel, filter)
        case 'platform':
            return checkStringsFilter(user.platform, filter)
        case 'customData':
            return checkCustomData(user.customData, filter) || checkCustomData(user.privateCustomData, filter)
        default:
            return false
    }
}

export const convertToSemanticVersion = (version: string): string => {
    const splitVersion = version.split('.')
    if (splitVersion.length < 2) { splitVersion.push('0') }
    if (splitVersion.length < 3) { splitVersion.push('0') }

    splitVersion.forEach((value, index) => {
        if (value === '') { splitVersion[index] = '0' }
    })
    return splitVersion.join('.')
}

export const checkVersionValue = (
    filterVersion: string | null,
    version: string | null,
    operator: string | null
): bool => {
    if (version && filterVersion && filterVersion.length > 0) {
        const result = versionCompare(version, filterVersion, { zeroExtend: true, lexicographical: false })
        if (isNaN(result)) {
            return false
        } else if (result === 0 && includes(operator, '=')) {
            return true
        } else if (result === 1 && includes(operator, '>')) {
            return true
        } else if (result === -1 && includes(operator, '<')) {
            return true
        }
    }
    return false
}

export const checkVersionFilter = (
    version: string | null,
    filterVersions: unknown[] | null,
    operator: string | null
): bool => {
    let parsedOperator = operator
    let parsedVersion = version
    if (!parsedVersion || !filterVersions) {
        return false
    }

    let filterVersionsTemp: string[] = filterVersions.filter((val) => typeof val === 'string') as string[]

    let not = false
    if (parsedOperator === '!=') {
        parsedOperator = '='
        not = true
    }

    for (let i = 0; i < filterVersionsTemp.length; i++) {
        const v = filterVersionsTemp[i]
        if (typeof v !== 'string') {
            return false
        }
    }

    if (parsedOperator !== '=') {
        // remove any non-number and . characters, and remove everything after a hyphen
        // eg. 1.2.3a-b6 becomes 1.2.3
        const regex1 = new RegExp("/[^(\d|.|\-)]/", "g")
        const regex2 = new RegExp("/-.*/", "g")
        parsedVersion = replace(replace(parsedVersion, regex1, ''), regex2, '')
        filterVersionsTemp = filterVersionsTemp.map(
            (filterVersion) => replace(replace(filterVersion, regex1, ''), regex2, '')
        )
    }
    parsedVersion = convertToSemanticVersion(parsedVersion)
    const passed = filterVersionsTemp.some((v) => checkVersionValue(v, parsedVersion, operator))
    return !not ? passed : !passed
}

export const checkNumberFilter = (num: f64, filterNums: f64[] | null, operator: string | null): bool => {
    if (isString(operator)) {
        switch (operator) {
            case 'exist':
                return !isNaN(num)
            case '!exist':
                return isNaN(num)
        }
    }

    if (!filterNums || isNaN(num)) {
        return false
    }

    return filterNums.some((filterNum) => {
        if (isNaN(filterNum)) {
            return false
        }

        switch (operator) {
            case '=':
                return (num === filterNum)
            case '!=':
                return (num !== filterNum)
            case '>':
                return (num > filterNum)
            case '>=':
                return (num >= filterNum)
            case '<':
                return (num < filterNum)
            case '<=':
                return (num <= filterNum)
        }
        return false
    })
}

const checkNumbersFilterJSONValue = (jsonValue: JSON.Value, filter: AudienceFilterOrOperator): bool => {
    return checkNumbersFilter(getF64FromJSONValue(jsonValue), filter)
}

export const checkNumbersFilter = (number: f64, filter: AudienceFilterOrOperator): bool => {
    const operator = filter.comparator
    const values = getFilterValuesAsF64(filter)
    return checkNumberFilter(number, values, operator)
}

export const checkStringsFilter = (string: string | null, filter: AudienceFilterOrOperator): bool => {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)

    switch (operator) {
        case '=':
            return !!values && string !== null && values.includes(string)
        case '!=':
            return !!values && string !== null && !values.includes(string)
        case 'exist':
            return string !== null && string !== ''
        case '!exist':
            return string === null || string === ''
        case 'contain':
            return (!!values && string !== null && !!find(values, (value) => includes(string, value)))
        case '!contain':
            return (!!values && (string === null || !find(values, (value) => includes(string, value))))
    }
    return isString(string)
}

export const checkBooleanFilter = (bool: bool, filter: AudienceFilterOrOperator): bool => {
    const operator = filter.comparator
    const values = getFilterValuesAsBoolean(filter)
    switch (operator) {
        case 'contain':
        case '=':
            return !!values && isBoolean(bool) && values.includes(bool)
        case '!contain':
        case '!=':
            return !!values && isBoolean(bool) && !values.includes(bool)
        case 'exist':
            return isBoolean(bool)
        case '!exist':
            return !isBoolean(bool)
    }

    return false
}

export const checkVersionFilters = (appVersion: string | null, filter: AudienceFilterOrOperator): bool => {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return checkStringsFilter(appVersion, filter)
    } else {
        return checkVersionFilter(appVersion, values, operator)
    }
}

export const checkCustomData = (data: JSON.Obj | null, filter: AudienceFilterOrOperator): bool => {
    const values = getFilterValues(filter)
    const operator = filter.comparator

    if (filter.dataKey) {
        const firstValue = values && values[0]
        const dataValue = data ? data.get(filter.dataKey) : null

        if (operator === 'exist') {
            return checkValueExists(dataValue)
        } else if (operator === '!exist') {
            return !checkValueExists(dataValue)
        } else if (firstValue && firstValue.isString && dataValue && dataValue.isString) {
            const jsonStr = dataValue as JSON.Str
            return checkStringsFilter(jsonStr.valueOf(), filter)
        } else if (firstValue && (firstValue.isFloat || firstValue.isInteger)
            && dataValue && (dataValue.isFloat || dataValue.isInteger)) {
            return checkNumbersFilterJSONValue(dataValue, filter)
        } else if (firstValue && firstValue.isBool && dataValue && dataValue.isBool) {
            const jsonBool = dataValue as JSON.Bool
            return checkBooleanFilter(jsonBool.valueOf(), filter)
        } else if (!dataValue && operator === '!=') {
            return true
        } else {
            return false
        }
    }
    return true
}

// const checkListAudienceFilterOrOperator = ({ values = [], data, comparator }) => {
//     const isInListAudience = values.some((value) => {
//         if (!isObject(value)) {
//             throw new Error('ListAudience filter must be an object, has not been prepared for segmentation')
//         }
//         return data.some((datum) => isEqual(datum, value))
//     })
//
//     return comparator === '=' ? !!isInListAudience : !isInListAudience
// }
// exports.checkListAudienceFilter = checkListAudienceFilter

//
// const checkListAudienceFields = (data, filters) => {
//     if (!filters || !filters.length) return true
//
//     return filters.every((filter) => {
//         const values = getFilterValues(filter)
//         const comparator = filter.comparator
//         return checkListAudienceFilter({ data, values, comparator })
//     })
// }
// exports.checkListAudienceFields = checkListAudienceFields

export function getFilterValues(filter: AudienceFilterOrOperator): JSON.Value[] | null {
    if (!filter.values || !filter.isArr) return null
    const valuesArray = filter.values as JSON.Arr
    const jsonValues = valuesArray.valueOf().filter((val: JSON.Value) => {
        return !(val === null || val === undefined)
    })

    return jsonValues.length ? jsonValues : null
}

export function getFilterValuesAsStrings(filter: AudienceFilterOrOperator): string[] | null {
    const jsonValues = getFilterValues(filter)
    return jsonValues
        ? jsonValues.map((value) => {
            const str = value.isString ? value as JSON.Str : null
            return str ? str.valueOf() : null
        }).filter((v) => v !== null) as string[]
        : null
}

export function getFilterValuesAsF64(filter: AudienceFilterOrOperator): f64[] | null {
    const jsonValues = getFilterValues(filter)
    return jsonValues
        ? jsonValues.map((value) => getF64FromJSONValue(value))
            .filter((v) => isNaN(v))
        : null
}

export function getFilterValuesAsBoolean(filter: AudienceFilterOrOperator): bool[] | null {
    const jsonValues = getFilterValues(filter)
    return jsonValues
        ? jsonValues.map((value) => {
            const boolVal = value.isBool ? value as JSON.Bool : null
            return boolVal ? boolVal.valueOf() : null
        }).filter((v) => v !== null) as bool[]
        : null
}

// export const parseUserAgent = (uaString?: string): {
//     browser?: string,
//     browserDeviceType?: string
// } => {
//     // Note: Anything that is not in this map will return Desktop
//     const DEVICES_MAP: Record<string, string> = {
//         'mobile': 'Mobile',
//         'tablet': 'Tablet'
//     }
//
//     // Note: Anything that is not in this map will return Other
//     const BROWSER_MAP: Record<string, string> = {
//         'Chrome': 'Chrome',
//         'Chrome Headless': 'Chrome',
//         'Chrome WebView': 'Chrome',
//         'Chromium': 'Chrome',
//         'Firefox': 'Firefox',
//         'Safari': 'Safari',
//         'Mobile Safari': 'Safari'
//     }
//
//     if (!uaString) {
//         return {
//             browser: undefined,
//             browserDeviceType: undefined
//         }
//     }
//
//     const parser = new UAParser(uaString)
//
//     return {
//         browser: BROWSER_MAP[parser.getBrowser().name || ''] || 'Other',
//         browserDeviceType: DEVICES_MAP[parser.getDevice().type || ''] || 'Desktop'
//     }
// }

/**
 * Returns true if the given value is not a type we define as "nonexistent" (NaN, empty string etc.)
 * Used only for values we don't have a specific datatype for (eg. customData values)
 * If value has a datatype, use one of the type checkers above (eg. checkStringFilter)
 * NOTE: The use of Number.isNaN is required over the global isNaN as the check it performs is more specific
 */
function checkValueExists(value: JSON.Value | null): bool {
    if (!value) return false
    const stringValue = value.isString ? value as JSON.Str : null
    const floatValue = value.isFloat ? value as JSON.Float : null
    const intValue = value.isInteger ? value as JSON.Integer : null

    // TODO: test these changes
    return value !== undefined
        && value !== null
        && (!stringValue || stringValue.valueOf() !== '')
        && (!floatValue || !isNaN(floatValue.valueOf()))
        && (!intValue || !isNaN(intValue.valueOf()))
}
