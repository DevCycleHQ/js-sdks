import { RegExp } from 'assemblyscript-regex/assembly'
import { findString, includes, replace } from '../helpers/lodashHelpers'
import { OptionsType, versionCompare } from './versionCompare'
import {
    AudienceOperator,
    AudienceFilter,
    validSubTypes,
    CustomDataFilter,
    UserFilter,
    NoIdAudience,
    AudienceMatchFilter,
    CustomDataValue,
    CustomDataValueInterpreter,
    DVCPopulatedUserPB
} from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { getF64FromJSONValue } from '../helpers/jsonHelpers'

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param audiences - a map of audience_id to audience, used for audienceMatch filters
 * @param user - The incoming user, device, and user agent data
 * @param clientCustomData - The custom data object associated with the client instance
 */
export function _evaluateOperator(
    operator: AudienceOperator,
    audiences: Map<string, NoIdAudience>,
    user: DVCPopulatedUserPB,
    clientCustomData: Map<string, CustomDataValue>
): bool {
    if (!operator.filters.length) return false

    if (operator.operator === 'or') {
        // Replace Array.some() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (filter.operatorClass !== null) {
                return _evaluateOperator(filter.operatorClass as AudienceOperator, audiences, user, clientCustomData)
            } else if (filter.filterClass !== null
                && doesUserPassFilter(filter.filterClass as AudienceFilter, audiences, user, clientCustomData)) {
                return true
            }
        }
        return false
    } else if (operator.operator === 'and'){
        // Replace Array.every() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (filter.operatorClass !== null) {
                return _evaluateOperator(filter.operatorClass as AudienceOperator, audiences, user, clientCustomData)
            } else if (filter.filterClass !== null
                && !doesUserPassFilter(filter.filterClass as AudienceFilter, audiences, user, clientCustomData)) {
                return false
            }
        }
        return true
    } else {
        return false
    }
}

function doesUserPassFilter(
    filter: AudienceFilter,
    audiences: Map<string, NoIdAudience>,
    user: DVCPopulatedUserPB,
    clientCustomData: Map<string, CustomDataValue>
): bool {
    let isValid = true

    if (filter.type === 'all') return true
    else if (filter.type === 'optIn') return false
    else if (filter.type === 'audienceMatch') {
        if (!(filter as AudienceMatchFilter).isValid) {
            isValid = false
        } else {
            return filterForAudienceMatch(filter as AudienceMatchFilter, audiences, user, clientCustomData)
        }
    } else if (!(filter instanceof UserFilter)) {
        isValid = false
    }

    if (isValid) {
        const userFilter = filter as UserFilter
        if (userFilter.isValid) {
            const subType = userFilter.subType
            if (validSubTypes.includes(subType)) {
                return filterFunctionsBySubtype(subType, user, userFilter, clientCustomData)
            }
        }
    }

    console.log(`[DevCycle] Warning: Invalid filter data ${filter}.
        To leverage this new filter definition, please update to the latest version of the DevCycle SDK.`)
    return false
}

function filterForAudienceMatch(
    filter: AudienceMatchFilter,
    configAudiences: Map<string, NoIdAudience>,
    user: DVCPopulatedUserPB,
    clientCustomData: Map<string, CustomDataValue>
): bool {
    const audiences = getFilterAudiencesAsStrings(filter)
    const comparator = filter.comparator
    // Recursively evaluate every audience in the _audiences array
    for (let i = 0; i < audiences.length; i++) {
        if (!configAudiences.has(audiences[i])){
            console.log(`
            [DevCycle] Warning: Invalid audience referenced by audienceMatch filter.
        `)
            return false
        }
        const audience = configAudiences.get(audiences[i])
        if (_evaluateOperator(audience.filters, configAudiences, user, clientCustomData)) {
            // If the user is in any of the audiences return early.
            return comparator === '='
        }
    }
    // The user is not in any of the audiences.
    return comparator === '!='
}
function filterFunctionsBySubtype(
    subType: string,
    user: DVCPopulatedUserPB,
    filter: UserFilter,
    clientCustomData: Map<string, CustomDataValue>
): bool {
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
        return _checkCustomData(user, clientCustomData, filter as CustomDataFilter)
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
        for (let i = 0; i < filterVersions.length; i++) {
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
    const values = filter.getNumberValues()
    return _checkNumberFilter(number, values, operator)
}

export function _checkStringsFilter(string: string | null, filter: UserFilter): bool {
    const operator = filter.comparator
    const values = filter.getStringValues()

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
    const values = filter.getBooleanValues()

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
    const values = filter.getStringValues()
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return _checkStringsFilter(appVersion, filter)
    } else {
        return checkVersionFilter(appVersion, values, operator)
    }
}

export function _checkCustomData(
    user: DVCPopulatedUserPB,
    clientCustomData: Map<string, CustomDataValue>,
    filter: CustomDataFilter
): bool {
    const operator = filter.comparator

    let dataValue = user.getCustomDataValue(filter.dataKey)
    if (dataValue === null && clientCustomData.has(filter.dataKey)) {
        dataValue = clientCustomData.get(filter.dataKey)
    }

    if (operator === 'exist') {
        return checkValueExists(dataValue)
    } else if (operator === '!exist') {
        return !checkValueExists(dataValue)
    } else if (filter.dataKeyType === 'String'
        && dataValue
        && (CustomDataValueInterpreter.isString(dataValue) || CustomDataValueInterpreter.isNull(dataValue))
    ) {
        if (CustomDataValueInterpreter.isNull(dataValue)) {
            return _checkStringsFilter(null, filter)
        } else {
            return _checkStringsFilter(CustomDataValueInterpreter.asString(dataValue), filter)
        }
    } else if (filter.dataKeyType === 'Number'
        && dataValue && CustomDataValueInterpreter.isFloat(dataValue)) {
        return _checkNumbersFilter(CustomDataValueInterpreter.asNumber(dataValue), filter)
    } else if (filter.dataKeyType === 'Boolean' && dataValue && CustomDataValueInterpreter.isBool(dataValue)) {
        return _checkBooleanFilter(CustomDataValueInterpreter.asBool(dataValue), filter)
    } else if (!dataValue && operator === '!=') {
        return true
    } else {
        return false
    }
}

export function getFilterAudiences(filter: AudienceMatchFilter): JSON.Value[] {
    const _audiences = filter._audiences

    return _audiences.valueOf().reduce((accumulator, audience) => {
        if (audience !== null) {
            accumulator.push(audience)
        }
        return accumulator
    }, [] as JSON.Value[])
}

export function getFilterAudiencesAsStrings(filter: AudienceMatchFilter): string[] {
    const jsonAudiences = getFilterAudiences(filter)

    return jsonAudiences.reduce((accumulator, audience) => {
        const str = audience.isString ? audience as JSON.Str : null
        if (str) {
            accumulator.push(str.valueOf())
        }
        return accumulator
    }, [] as string[])
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

/**
 * Returns true if the given value is not a type we define as "nonexistent" (NaN, empty string etc.)
 * Used only for values we don't have a specific datatype for (eg. customData values)
 * If value has a datatype, use one of the type checkers above (eg. checkStringFilter)
 * NOTE: The use of Number.isNaN is required over the global isNaN as the check it performs is more specific
 */
function checkValueExists(value: CustomDataValue | null): bool {
    if (!value) return false

    if (CustomDataValueInterpreter.isString(value)) {
        const stringValue = CustomDataValueInterpreter.asString(value)
        return stringValue !== null && stringValue !== ''
    } else if (CustomDataValueInterpreter.isFloat(value)) {
        const floatValue = CustomDataValueInterpreter.asNumber(value)
        return floatValue !== null && !isNaN(floatValue)
    } else if (CustomDataValueInterpreter.isBool(value)) {
        return true
    }

    return false
}
