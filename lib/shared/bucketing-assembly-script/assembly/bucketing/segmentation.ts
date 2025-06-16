import { RegExp } from 'assemblyscript-regex/assembly'
import { findString, includes, replace, stringEndsWith, stringStartsWith } from '../helpers/lodashHelpers'
import { OptionsType, versionCompare } from './versionCompare'
import {
    AudienceOperator,
    AudienceFilter,
    DVCPopulatedUser,
    validSubTypes,
    CustomDataFilter,
    UserFilter,
    AudienceMatchFilter,
    Audience,
    EVAL_REASON_DETAILS
} from '../types'
import { JSON } from '@devcycle/assemblyscript-json/assembly'
import { getF64FromJSONValue } from '../helpers/jsonHelpers'

export class SegmentationResult extends JSON.Value {
    readonly result: bool
    readonly reasonDetails: string | null

    constructor(result: bool, reasonDetails: string | null = null) {
        super()
        this.result = result
        this.reasonDetails = reasonDetails
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('result', this.result)
        if (this.reasonDetails !== null) {
            json.set('reasonDetails', this.reasonDetails!)
        }
        return json.stringify()
    }
}
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
    audiences: Map<string, Audience>,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): SegmentationResult {
    if (!operator.filters.length) return new SegmentationResult(false)

    if (operator.operator === 'or') {
        // Replace Array.some() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (filter.operatorClass !== null) {
               const evalResultWithReason =
                    _evaluateOperator(filter.operatorClass as AudienceOperator, audiences, user, clientCustomData)
                // Instead of returning the value from only the first filter,
                // we want to return true if any of the filters are true
                if(evalResultWithReason.result) {
                    return evalResultWithReason
                }
            } else if (filter.filterClass !== null) {
                const evalResultWithReason = 
                    doesUserPassFilter(filter.filterClass as AudienceFilter, audiences, user, clientCustomData)
                if(evalResultWithReason.result) {
                    return evalResultWithReason
                }
            }
        }
        return new SegmentationResult(false) 
    } else if (operator.operator === 'and'){
        const reasons = new Array<string>()
        // Replace Array.every() logic
        for (let i = 0; i < operator.filters.length; i++) {
            const filter = operator.filters[i]
            if (filter.operatorClass !== null) {
               return _evaluateOperator(filter.operatorClass as AudienceOperator, audiences, user, clientCustomData)
            } else if (filter.filterClass !== null) {
                const evalResultWithReason = 
                    doesUserPassFilter(filter.filterClass as AudienceFilter, audiences, user, clientCustomData)
                if(evalResultWithReason.result && evalResultWithReason.reasonDetails){
                    reasons.push(evalResultWithReason.reasonDetails!)
                } else {
                    return new SegmentationResult(false)
                }
            }
        }
        const allReasons = reasons.join(' AND ') 
        return new SegmentationResult(true, allReasons)
    } else {
        return new SegmentationResult(false) 
    }
}

function doesUserPassFilter(
    filter: AudienceFilter,
    audiences: Map<string, Audience>,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): SegmentationResult {
    let isValid = true

    if (filter.type === 'all') return new SegmentationResult(true, EVAL_REASON_DETAILS.ALL_USERS)
    else if (filter.type === 'optIn') {
            return new SegmentationResult(false)
    } else if (filter.type === 'audienceMatch') {
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
    return new SegmentationResult(false)
}

function filterForAudienceMatch(
    filter: AudienceMatchFilter,
    configAudiences: Map<string, Audience>,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): SegmentationResult {
    const audiences = getFilterAudiencesAsStrings(filter)
    const comparator = filter.comparator
    // Recursively evaluate every audience in the _audiences array
    for (let i = 0; i < audiences.length; i++) {
        if (!configAudiences.has(audiences[i])){
            console.log(`
            [DevCycle] Warning: Invalid audience referenced by audienceMatch filter.
        `)
            return new SegmentationResult(false)
        }
        const audience = configAudiences.get(audiences[i])
        const result = _evaluateOperator(audience.filters, configAudiences, user, clientCustomData)
        if (result.result) {
            // If the user is in any of the audiences return early.
            const matchResult = comparator === '='
            const reasonDetails = matchResult 
                ? EVAL_REASON_DETAILS.AUDIENCE_MATCH + (result.reasonDetails ? ' -> ' + result.reasonDetails! : '')
                : null
            return new SegmentationResult(matchResult, reasonDetails)
        }
    }
    // The user is not in any of the audiences.
    const matchResult = comparator === '!='
    const reasonDetails = matchResult ? EVAL_REASON_DETAILS.NOT_IN_AUDIENCE : null
    return new SegmentationResult(matchResult, reasonDetails)
}

function filterFunctionsBySubtype(
    subType: string,
    user: DVCPopulatedUser,
    filter: UserFilter,
    clientCustomData: JSON.Obj
): SegmentationResult {
    if (subType === 'country') {
        const result = _checkStringsFilter(user.country, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.COUNTRY : null)
    } else if (subType === 'email') {
        const result = _checkStringsFilter(user.email, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.EMAIL : null)
    } else if (subType === 'user_id') {
        const result = _checkStringsFilter(user.user_id, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.USER_ID : null)
    } else if (subType === 'appVersion') {
        const result = _checkVersionFilters(user.appVersion, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.APP_VERSION : null)
    } else if (subType === 'platformVersion') {
        const result = _checkVersionFilters(user.platformVersion, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.PLATFORM_VERSION : null)
    } else if (subType === 'deviceModel') {
        const result = _checkStringsFilter(user.deviceModel, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.DEVICE_MODEL : null)
    } else if (subType === 'platform') {
        const result = _checkStringsFilter(user.platform, filter)
        return new SegmentationResult(result, result ? EVAL_REASON_DETAILS.PLATFORM : null)
    } else if (subType === 'customData') {
        if (!(filter instanceof CustomDataFilter)) {
            throw new Error('Invalid filter data')
        }
        const result = _checkCustomData(user.getCombinedCustomData(), clientCustomData, filter as CustomDataFilter)
        return new SegmentationResult(result, result ? `${EVAL_REASON_DETAILS.CUSTOM_DATA} -> ${(filter as CustomDataFilter).dataKey}` : null)
    } else {
        return new SegmentationResult(false)
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

    if (operator === '!=') {
        let passesFilter = true
        for (let i = 0; i < filterNums.length; i++) {
            const filterNum = filterNums[i]
            if (isNaN(filterNum) || num === filterNum) {
                passesFilter = false
            }
        }
        return passesFilter
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
    } else if (operator === 'startWith') {
        return string !== null && _checkValueStartsWith(string, values)
    } else if (operator === '!startWith') {
        return string === null || !_checkValueStartsWith(string, values)
    } else if (operator === 'endWith') {
        return string !== null && _checkValueEndsWith(string, values)
    } else if (operator === '!endWith') {
        return string === null || !_checkValueEndsWith(string, values)
    } else {
        return isString(string)
    }
}

function _checkValueStartsWith(string: string, values: string[] | null): bool {
    if(!values) return false
    for (let i = 0; i < values.length; i++) {
        if (stringStartsWith(string, values[i])) {
            return true
        }
    }
    return false
}
function _checkValueEndsWith(string: string, values: string[]| null): bool {
    if(!values) return false
    for (let i = 0; i < values.length; i++) {
        if (stringEndsWith(string, values[i])) {
            return true
        }
    }
    return false
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

export function _checkCustomData(data: JSON.Obj | null, clientCustomData: JSON.Obj, filter: CustomDataFilter): bool {
    const operator = filter.comparator

    let dataValue = data ? data.get(filter.dataKey) : null
    if (dataValue === null) {
        dataValue = clientCustomData.get(filter.dataKey)
    }

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
        return _checkBooleanFilter(boolValue.valueOf(), filter)
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
function checkValueExists(value: JSON.Value | null): bool {
    if (!value) return false
    const stringValue = value.isString ? value as JSON.Str : null
    const floatValue = value.isFloat ? value as JSON.Float : null
    const intValue = value.isInteger ? value as JSON.Integer : null
    const boolValue = value.isBool ? value as JSON.Bool : null

    return value !== null
        && !!(stringValue || floatValue || intValue || boolValue)
        && (!stringValue || stringValue.valueOf() !== '')
        && (!floatValue || !isNaN(floatValue.valueOf()))
        && (!intValue || !isNaN(intValue.valueOf()))
}
