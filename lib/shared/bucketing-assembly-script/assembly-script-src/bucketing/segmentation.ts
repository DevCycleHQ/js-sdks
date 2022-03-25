import { RegExp } from 'assemblyscript-regex'
import {  findString, includes, replace} from '../helpers/lodashHelpers'
import { OptionsType, versionCompare } from './versionCompare'
import {
    TopLevelOperator, AudienceFilterOrOperator, DVCPopulatedUser, validSubTypes
} from '../types'
import { JSON } from 'assemblyscript-json'
import { getF64FromJSONValue } from '../helpers/jsonHelpers'

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param data - The incoming user, device, and user agent data
 */
export function evaluateOperator(operator: TopLevelOperator, data: DVCPopulatedUser): bool {
    if (!operator.filters.length) return false

    userFilterData = data
    if (operator.operator === 'or') {
        const result = operator.filters.some((filter) => doesUserPassFilter(filter))
        userFilterData = null
        return result
    } else {
        const result = operator.filters.every((filter) => doesUserPassFilter(filter))
        userFilterData = null
        return result
    }
}

// Hack because we can't capture data in closures
let userFilterData: DVCPopulatedUser | null
function doesUserPassFilter(filter: AudienceFilterOrOperator): bool {
    if (filter.type === 'all') return true
    if (!filter.subType || !userFilterData) {
        throw new Error(`Missing filter subType`)
    }
    const subType = filter.subType as string
    if (!validSubTypes.includes(subType)) {
        throw new Error(`Invalid filter subType: ${subType}`)
    }

    return filterFunctionsBySubtype(subType, userFilterData as DVCPopulatedUser, filter)
}

function filterFunctionsBySubtype(subType: string, user: DVCPopulatedUser, filter: AudienceFilterOrOperator): bool {
    if (subType === 'country') {
        return checkStringsFilter(user.country, filter)
    } else if (subType === 'email') {
        return checkStringsFilter(user.email, filter)
    } else if (subType === 'user_id') {
        return checkStringsFilter(user.user_id, filter)
    } else if (subType === 'appVersion') {
        return checkVersionFilters(user.appVersion, filter)
    } else if (subType === 'platformVersion') {
        return checkVersionFilters(user.platformVersion, filter)
    } else if (subType === 'deviceModel') {
        return checkStringsFilter(user.deviceModel, filter)
    } else if (subType === 'platform') {
        return checkStringsFilter(user.platform, filter)
    } else if (subType === 'customData') {
        return checkCustomData(user.customData, filter) || checkCustomData(user.privateCustomData, filter)
    } else {
        return false
    }
}

export const convertToSemanticVersion = (version: string): string => {
    const splitVersion = version.split('.')
    if (splitVersion.length < 2) { splitVersion.push('0') }
    if (splitVersion.length < 3) { splitVersion.push('0') }

    for (let i = 0; i < splitVersion.length; i++) {
        const value = splitVersion[i]
        if (value === '') { splitVersion[i] = '0' }
    }
    return splitVersion.join('.')
}

export const checkVersionValue = (
    filterVersion: string | null,
    version: string | null,
    operator: string | null
): bool => {
    if (version && filterVersion && filterVersion.length > 0) {
        const options: OptionsType = { zeroExtend: true, lexicographical: false }
        const result = versionCompare(version, filterVersion, options)
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
    filterVersions: string[] | null,
    operator: string | null
): bool => {
    if (!version || !filterVersions || !operator) {
        return false
    }
    let filteredVersions = filterVersions as string[]
    let parsedVersion = version as string
    let parsedOperator = operator as string

    let not = false
    if (parsedOperator === '!=') {
        parsedOperator = '='
        not = true
    }

    if (parsedOperator !== '=') {
        // remove any non-number and . characters, and remove everything after a hyphen
        // eg. 1.2.3a-b6 becomes 1.2.3
        const regex1 = new RegExp("/[^(\d|.|\-)]/", "g")
        const regex2 = new RegExp("/-.*/", "g")
        parsedVersion = replace(replace(parsedVersion, regex1, ''), regex2, '')

        let mappedfilteredVersions: string[] = []
        // Replace Array.map(), because you can't access captured data in a closure
        for (let i=0; i < filteredVersions.length; i++) {
            mappedfilteredVersions.push(replace(replace(filteredVersions[i], regex1, ''), regex2, ''))
        }
        filteredVersions = mappedfilteredVersions
    }

    parsedVersion = convertToSemanticVersion(parsedVersion)
    let passed = false
    // Replace Array.some(), because you can't access captured data in a closure
    for (let i = 0; i < filteredVersions.length; i++) {
         if (checkVersionValue(filteredVersions[i], parsedVersion, operator)) {
             passed = true
             break
         }
    }

    return !not ? passed : !passed
}

export const checkNumberFilter = (num: f64, filterNums: f64[] | null, operator: string | null): bool => {
    if (operator && isString(operator)) {
        if (operator === 'exists') {
            return !isNaN(num)
        } else if (operator === '!exist') {
            return isNaN(num)
        }
    }

    if (!filterNums || isNaN(num)) {
        return false
    }

    // replace filterNums.some() logic
    let someValue = false
    for (let i = 0; i < filterNums.length; i++) {
        const filterNum = filterNums[i]
        if (isNaN(filterNum)) {
            continue
        }

        if (operator === '=') {
            someValue = num === filterNum
        } else if (operator === '!=') {
            someValue = num !== filterNum
        } else if (operator === '>') {
            someValue = num > filterNum
        } else if (operator === '>=') {
            someValue = num >= filterNum
        } else if (operator === '<') {
            someValue = num < filterNum
        } else if (operator === '<=') {
            someValue = num <= filterNum
        } else {
            continue
        }

        if (someValue) {
            return true
        }
    }
    return someValue
}

function checkNumbersFilterJSONValue(jsonValue: JSON.Value, filter: AudienceFilterOrOperator): bool {
    return checkNumbersFilter(getF64FromJSONValue(jsonValue), filter)
}

export function checkNumbersFilter(number: f64, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsF64(filter)
    return checkNumberFilter(number, values, operator)
}

export function checkStringsFilter(string: string | null, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)

    if (operator === '=') {
        return !!values && string !== null && values.includes(string)
    } else if (operator === '!=') {
        return !!values && string !== null && !values.includes(string)
    } else if (operator === 'exist') {
        return string !== null && string !== ''
    } else if (operator === '!exist') {
        return string === null || string === ''
    } else if (operator === 'contain') {
        return (!!values && string !== null && !!findString(values, string))
    } else if (operator === '!contain') {
        return (!!values && (string === null || !findString(values, string)))
    } else {
        return isString(string)
    }
}

export function checkBooleanFilter(bool: bool, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsBoolean(filter)

    if (operator === 'contain' || operator === '=') {
        return !!values && isBoolean(bool) && values.includes(bool)
    } else if (operator === '!contain' || operator === '!=') {
        return !!values && isBoolean(bool) && !values.includes(bool)
    } else if (operator === 'exist') {
        return isBoolean(bool)
    } else if (operator === '!exist') {
        return !isBoolean(bool)
    } else {
        return false
    }
}

export function checkVersionFilters(appVersion: string | null, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return checkStringsFilter(appVersion, filter)
    } else {
        return checkVersionFilter(appVersion, values, operator)
    }
}

export function checkCustomData(data: JSON.Obj | null, filter: AudienceFilterOrOperator): bool {
    const values = getFilterValues(filter)
    const operator = filter.comparator

    if (filter.dataKey) {
        const firstValue = values.length > 0 ? values[0] : null
        const dataValue = data ? data.get(filter.dataKey as string) : null

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

export function getFilterValues(filter: AudienceFilterOrOperator): JSON.Value[] {
    if (!filter.values || !filter.isArr) return []

    const valuesArray = filter.values as JSON.Arr
    return valuesArray.valueOf().reduce((accumulator, value) => {
        if (value !== null) {
            accumulator.push(value)
        }
        return accumulator
    }, [] as JSON.Value[])
}

export function getFilterValuesAsStrings(filter: AudienceFilterOrOperator): string[] {
    const jsonValues = getFilterValues(filter)
    if (!jsonValues) return []

    return jsonValues.reduce((accumulator, value) => {
        const str = value.isString ? value as JSON.Str : null
        if (str) {
            accumulator.push(str.valueOf())
        }
        return accumulator
    }, [] as string[])
}

export function getFilterValuesAsF64(filter: AudienceFilterOrOperator): f64[] {
    const jsonValues = getFilterValues(filter)
    if (!jsonValues) return []

    return jsonValues.reduce((accumulator, value) => {
        const num = getF64FromJSONValue(value)
        if (!isNaN(num)) {
            accumulator.push(num)
        }
        return accumulator
    }, [] as f64[])
}

export function getFilterValuesAsBoolean(filter: AudienceFilterOrOperator): bool[] {
    const jsonValues = getFilterValues(filter)
    if (!jsonValues) return []

    return jsonValues.reduce((accumulator, value) => {
        const boolVal = value.isBool ? value as JSON.Bool : null
        if (boolVal) {
            accumulator.push(boolVal.valueOf())
        }
        return accumulator
    }, [] as bool[])
}

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
    const boolValue = value.isBool ? value as JSON.Bool : null

    // TODO: test these changes
    return value !== null
        && !!(stringValue || floatValue || intValue || boolValue)
        && (!stringValue || stringValue.valueOf() !== '')
        && (!floatValue || !isNaN(floatValue.valueOf()))
        && (!intValue || !isNaN(intValue.valueOf()))
}
