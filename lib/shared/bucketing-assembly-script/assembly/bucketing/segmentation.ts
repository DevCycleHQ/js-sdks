import { RegExp } from 'assemblyscript-regex/assembly'
import {  findString, includes, replace } from '../helpers/lodashHelpers'
import { OptionsType, versionCompare } from './versionCompare'
import {
    TopLevelOperator, 
    AudienceFilterOrOperator, 
    DVCPopulatedUser, 
    validSubTypes, 
    CustomDataFilter,
    UserFilter, 
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { getF64FromJSONValue } from '../helpers/jsonHelpers'

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param user - The incoming user, device, and user agent data
 */
export function _evaluateOperator(
    operator: TopLevelOperator, 
    user: DVCPopulatedUser, 
    featureId: string, 
    isOptInEnabled: boolean
): bool {
    if (!operator.filters.length) return false

    if (operator.operator === 'or') {
        // Replace Array.some() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (doesUserPassFilter(filter, user, featureId, isOptInEnabled)) {
                return true
            }
        }
        return false
    } else {
        // Replace Array.every() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (!doesUserPassFilter(filter, user, featureId, isOptInEnabled)) {
                return false
            }
        }
        return true
    }
}

function doesUserPassFilter(
    filter: AudienceFilterOrOperator, 
    user: DVCPopulatedUser, 
    featureId: string, 
    isOptInEnabled: boolean
): bool {
    if (filter.type === 'all') return true
    if (
        filter.type === 'optIn'
    ) {
        const userOptIns = user.optIns
        const featureOptIn = userOptIns !== null ? userOptIns.getBool(featureId) : null

        return isOptInEnabled && featureOptIn !== null && featureOptIn.valueOf()
    }

    if (!(filter instanceof UserFilter)) {
        throw new Error('Invalid filter data')
    }

    const userFilter = filter as UserFilter

    const subType = userFilter.subType
    if (!validSubTypes.includes(subType)) {
        throw new Error(`Invalid filter subType: ${subType}`)
    }

    return filterFunctionsBySubtype(subType, user, userFilter)
}

function filterFunctionsBySubtype(subType: string, user: DVCPopulatedUser, filter: UserFilter): bool {
    if (subType === 'country') {
        return _checkStringsFilter(user.country, filter)
    } else if (subType === 'email') {
        return _checkStringsFilter(user.email, filter)
    } else if (subType === 'user_id') {
        return _checkStringsFilter(user.user_id, filter)
    } else if (subType === 'appVersion') {
        return _checkVersionFilters(user.appVersion, filter)
    } else if (subType === 'platformVersion') {
        return _checkVersionFilters(user.platformVersion, filter)
    } else if (subType === 'deviceModel') {
        return _checkStringsFilter(user.deviceModel, filter)
    } else if (subType === 'platform') {
        return _checkStringsFilter(user.platform, filter)
    } else if (subType === 'customData') {
        if (!(filter instanceof CustomDataFilter)) {
            throw new Error('Invalid filter data')
        }
        return _checkCustomData(user.getCombinedCustomData(), filter as CustomDataFilter)
    } else {
        return false
    }
}

export function convertToSemanticVersion(version: string): string {
    const splitVersion = version.split('.')
    if (splitVersion.length < 2) { splitVersion.push('0') }
    if (splitVersion.length < 3) { splitVersion.push('0') }

    for (let i = 0; i < splitVersion.length; i++) {
        const value = splitVersion[i]
        if (value === '') { splitVersion[i] = '0' }
    }
    return splitVersion.join('.')
}

export function checkVersionValue(
    filterVersion: string,
    version: string | null,
    operator: string
): bool {
    if (version && filterVersion.length > 0) {
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

export function checkVersionFilter(
    version: string | null,
    filterVersions: string[],
    operator: string
): bool {
    if (!version) {
        return false
    }

    let parsedVersion = version
    let parsedOperator = operator

    let not = false
    if (parsedOperator === '!=') {
        parsedOperator = '='
        not = true
    }

    let parsedFilterVersions = filterVersions
    if (parsedOperator !== '=') {
        // remove any non-number and . characters, and remove everything after a hyphen
        // eg. 1.2.3a-b6 becomes 1.2.3
        const regex1 = new RegExp('[^(\\d|.|\\-)]', 'g')
        const regex2 = new RegExp('-.*', 'g')
        parsedVersion = replace(replace(parsedVersion, regex1, ''), regex2, '')

        const mappedFilterVersions: string[] = []
        // Replace Array.map(), because you can't access captured data in a closure
        for (let i=0; i < filterVersions.length; i++) {
            mappedFilterVersions.push(replace(replace(filterVersions[i], regex1, ''), regex2, ''))
        }
        parsedFilterVersions = mappedFilterVersions
    }

    parsedVersion = convertToSemanticVersion(parsedVersion)

    let passed = false
    // Replace Array.some(), because you can't access captured data in a closure
    for (let i = 0; i < parsedFilterVersions.length; i++) {
        if (checkVersionValue(parsedFilterVersions[i], parsedVersion, operator)) {
            passed = true
            break
        }
    }

    return !not ? passed : !passed
}

export function _checkNumberFilter(num: f64, filterNums: f64[], operator: string | null): bool {
    if (operator && isString(operator)) {
        if (operator === 'exist') {
            return !isNaN(num)
        } else if (operator === '!exist') {
            return isNaN(num)
        }
    }

    if (isNaN(num)) {
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

export function checkNumbersFilterJSONValue(jsonValue: JSON.Value, filter: UserFilter): bool {
    return _checkNumbersFilter(getF64FromJSONValue(jsonValue), filter)
}

function _checkNumbersFilter(number: f64, filter: UserFilter): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsF64(filter)
    return _checkNumberFilter(number, values, operator)
}

export function _checkStringsFilter(string: string | null, filter: UserFilter): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)

    if (operator === '=') {
        return string !== null && values.includes(string)
    } else if (operator === '!=') {
        return string !== null && !values.includes(string)
    } else if (operator === 'exist') {
        return string !== null && string !== ''
    } else if (operator === '!exist') {
        return string === null || string === ''
    } else if (operator === 'contain') {
        return string !== null && !!findString(values, string)
    } else if (operator === '!contain') {
        return string === null || !findString(values, string)
    } else {
        return isString(string)
    }
}

export function _checkBooleanFilter(bool: bool, filter: UserFilter): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsBoolean(filter)

    if (operator === 'contain' || operator === '=') {
        return isBoolean(bool) && values.includes(bool)
    } else if (operator === '!contain' || operator === '!=') {
        return isBoolean(bool) && !values.includes(bool)
    } else if (operator === 'exist') {
        return isBoolean(bool)
    } else if (operator === '!exist') {
        return !isBoolean(bool)
    } else {
        return false
    }
}

export function _checkVersionFilters(appVersion: string | null, filter: UserFilter): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return _checkStringsFilter(appVersion, filter)
    } else {
        return checkVersionFilter(appVersion, values, operator)
    }
}

export function _checkCustomData(data: JSON.Obj | null, filter: CustomDataFilter): bool {
    const operator = filter.comparator

    const dataValue = data ? data.get(filter.dataKey) : null

    if (operator === 'exist') {
        return checkValueExists(dataValue)
    } else if (operator === '!exist') {
        return !checkValueExists(dataValue)
    } else if (filter.dataKeyType === 'String' && dataValue && (dataValue.isString || dataValue.isNull)) {
        if (dataValue.isNull) {
            return _checkStringsFilter(null, filter)
        } else {
            const jsonStr = dataValue as JSON.Str
            return _checkStringsFilter(jsonStr.valueOf(), filter)
        }
    } else if (filter.dataKeyType === 'Number'
        && dataValue && (dataValue.isFloat || dataValue.isInteger)) {
        return checkNumbersFilterJSONValue(dataValue, filter)
    } else if (filter.dataKeyType === 'Boolean' && dataValue && dataValue.isBool) {
        const boolValue = dataValue as JSON.Bool
        const result = _checkBooleanFilter(boolValue.valueOf(), filter)
        return result
    } else if (!dataValue && operator === '!=') {
        return true
    } else {
        return false
    }
}

export function getFilterValues(filter: UserFilter): JSON.Value[] {
    const values = filter.values

    return values.valueOf().reduce((accumulator, value) => {
        if (value !== null) {
            accumulator.push(value)
        }
        return accumulator
    }, [] as JSON.Value[])
}

export function getFilterValuesAsStrings(filter: UserFilter): string[] {
    const jsonValues = getFilterValues(filter)

    return jsonValues.reduce((accumulator, value) => {
        const str = value.isString ? value as JSON.Str : null
        if (str) {
            accumulator.push(str.valueOf())
        }
        return accumulator
    }, [] as string[])
}

export function getFilterValuesAsF64(filter: UserFilter): f64[] {
    const jsonValues = getFilterValues(filter)

    return jsonValues.reduce((accumulator, value) => {
        const num = getF64FromJSONValue(value)
        if (!isNaN(num)) {
            accumulator.push(num)
        }
        return accumulator
    }, [] as f64[])
}

export function getFilterValuesAsBoolean(filter: UserFilter): bool[] {
    const jsonValues = getFilterValues(filter)

    return jsonValues.reduce((accumulator, value) => {
        const boolVal = value.isBool ? value as JSON.Bool : null
        if (boolVal !== null) {
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
