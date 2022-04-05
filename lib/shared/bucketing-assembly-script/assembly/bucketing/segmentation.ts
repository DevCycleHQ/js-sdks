import { RegExp } from 'assemblyscript-regex/assembly'
import {  findString, includes, replace} from '../helpers/lodashHelpers'
import { OptionsType, versionCompare } from './versionCompare'
import {
    TopLevelOperator, AudienceFilterOrOperator, DVCPopulatedUser, validSubTypes,
    DVCUser, Target as PublicTarget
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import {getF64FromJSONObj, getF64FromJSONValue} from '../helpers/jsonHelpers'

export function evaluateOperatorFromJSON(operatorStr: string, userStr: string): bool {
    const operatorJSON = JSON.parse(operatorStr)
    if (!operatorJSON.isObj) {
        throw new Error(`evaluateOperatorFromJSON operatorStr or userStr param not a JSON Object`)
    }
    const operator = new TopLevelOperator(operatorJSON as JSON.Obj)
    const user = new DVCPopulatedUser(new DVCUser(userStr))
    return _evaluateOperator(operator, user)
}

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param user - The incoming user, device, and user agent data
 */
export function _evaluateOperator(operator: TopLevelOperator, user: DVCPopulatedUser): bool {
    if (!operator.filters.length) return false

    if (operator.operator === 'or') {
        // Replace Array.some() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (doesUserPassFilter(filter, user)) {
                return true
            }
        }
        return false
    } else {
        // Replace Array.every() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (!doesUserPassFilter(filter, user)) {
                return false
            }
        }
        return true
    }
}

function doesUserPassFilter(filter: AudienceFilterOrOperator, user: DVCPopulatedUser): bool {
    if (filter.type === 'all') return true
    if (!filter.subType || !user) {
        throw new Error(`Missing filter subType`)
    }
    const subType = filter.subType as string
    if (!validSubTypes.includes(subType)) {
        throw new Error(`Invalid filter subType: ${subType}`)
    }

    return filterFunctionsBySubtype(subType, user, filter)
}

function filterFunctionsBySubtype(subType: string, user: DVCPopulatedUser, filter: AudienceFilterOrOperator): bool {
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
        return _checkCustomData(user.customData, filter) || _checkCustomData(user.privateCustomData, filter)
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
    filterVersion: string | null,
    version: string | null,
    operator: string | null
): bool{
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

export function checkVersionFilter(
    version: string | null,
    filterVersions: string[] | null,
    operator: string | null
): bool {
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

export function checkNumberFilterFromJSON(num: f64, filterNumsStr: string | null, operator: string | null): bool {
    const filterNumsJSON = JSON.parse(filterNumsStr)
    if (!filterNumsJSON.isArr) throw new Error(`checkNumberFilterFromJSON filterNumsStr param not a JSON Object`)

    const filterNums: f64[] = []
    const filterNumsJSONArr = (filterNumsJSON as JSON.Arr).valueOf()
    for (let i = 0; i < filterNumsJSONArr.length; i++) {
        const num = getF64FromJSONValue(filterNumsJSONArr[i])
        if (!isNaN(num)) {
            filterNums.push(num)
        }
    }
    return _checkNumberFilter(num, filterNums, operator)
}

export function _checkNumberFilter(num: f64, filterNums: f64[] | null, operator: string | null): bool {
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
    return _checkNumbersFilter(getF64FromJSONValue(jsonValue), filter)
}

export function checkNumbersFilterFromJSON(number: f64, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    if (!filterJSON.isObj) throw new Error(`checkStringsFilterFromJSON filterStr param not a JSON Object`)
    const filter = new AudienceFilterOrOperator(filterJSON as JSON.Obj)
    return _checkNumbersFilter(number, filter)
}

function _checkNumbersFilter(number: f64, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsF64(filter)
    return _checkNumberFilter(number, values, operator)
}

export function checkStringsFilterFromJSON(string: string | null, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    if (!filterJSON.isObj) throw new Error(`checkStringsFilterFromJSON filterStr param not a JSON Object`)
    const filter = new AudienceFilterOrOperator(filterJSON as JSON.Obj)
    return _checkStringsFilter(string, filter)
}

function _checkStringsFilter(string: string | null, filter: AudienceFilterOrOperator): bool {
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

export function checkBooleanFilterFromJSON(bool: bool, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    if (!filterJSON.isObj) throw new Error(`checkBooleanFilterFromJSON filterStr param not a JSON Object`)
    const filter = new AudienceFilterOrOperator(filterJSON as JSON.Obj)
    return _checkBooleanFilter(bool, filter)
}

export function _checkBooleanFilter(bool: bool, filter: AudienceFilterOrOperator): bool {
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

export function checkVersionFiltersFromJSON(appVersion: string | null, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    if (!filterJSON.isObj) throw new Error(`checkVersionFiltersFromJSON filterStr param not a JSON Object`)
    const filter = new AudienceFilterOrOperator(filterJSON as JSON.Obj)
    return _checkVersionFilters(appVersion, filter)
}

function _checkVersionFilters(appVersion: string | null, filter: AudienceFilterOrOperator): bool {
    const operator = filter.comparator
    const values = getFilterValuesAsStrings(filter)
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return _checkStringsFilter(appVersion, filter)
    } else {
        return checkVersionFilter(appVersion, values, operator)
    }
}

export function checkCustomDataFromJSON(data: string | null, filterStr: string): bool {
    const filterJSON = JSON.parse(filterStr)
    const dataJSON = JSON.parse(data)
    if (!filterJSON.isObj) throw new Error(`checkCustomDataFromJSON filterStr param not a JSON Object`)
    if (dataJSON && !dataJSON.isObj) throw new Error(`checkCustomDataFromJSON data param not a JSON Object`)
    const filter = new AudienceFilterOrOperator(filterJSON as JSON.Obj)
    const dataJSONObj = dataJSON ? dataJSON as JSON.Obj : null
    return _checkCustomData(dataJSONObj, filter)
}

function _checkCustomData(data: JSON.Obj | null, filter: AudienceFilterOrOperator): bool {
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
            return _checkStringsFilter(jsonStr.valueOf(), filter)
        } else if (firstValue && (firstValue.isFloat || firstValue.isInteger)
            && dataValue && (dataValue.isFloat || dataValue.isInteger)) {
            return checkNumbersFilterJSONValue(dataValue, filter)
        } else if (firstValue && firstValue.isBool && dataValue && dataValue.isBool) {
            const jsonBool = dataValue as JSON.Bool
            return _checkBooleanFilter(jsonBool.valueOf(), filter)
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
