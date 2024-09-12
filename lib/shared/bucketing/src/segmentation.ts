import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import includes from 'lodash/includes'
import find from 'lodash/find'
import { versionCompare } from './versionCompare'
import {
    PublicAudience,
    AudienceFilterOrOperator,
    UserSubType,
    FilterType,
    ConfigBody
} from '@devcycle/types'
import UAParser from 'ua-parser-js'

// TODO add support for OR/XOR as well as recursive filters
/**
 * Evaluate an operator object based on its contained filters and the user data given
 * Returns true if the user's data allows them through the segmentation
 * @param operator - The set of filters to evaluate, and the boolean operator to follow (AND, OR, XOR)
 * @param data - The incoming user, device, and user agent data
 * @returns {*|boolean|boolean}
 */
export const evaluateOperator = async ({
    operator,
    data,
    featureId,
    isOptInEnabled,
    audiences = {},
    config,
}: {
    operator: AudienceFilterOrOperator
    data: any
    featureId: string
    isOptInEnabled: boolean
    audiences?: { [id: string]: Omit<PublicAudience<string>, '_id'> }
    config: ConfigBody
}): Promise<boolean> => {
    if (!operator?.filters?.length) return false

    const doesUserPassFilter = async (filter: AudienceFilterOrOperator) => {
        if (filter.operator) {
            return evaluateOperator({
                operator: filter,
                data,
                featureId,
                isOptInEnabled,
                audiences,
                config,
            })
        }
        if (filter.type === FilterType.all) return true
        if (filter.type === FilterType.optIn) {
            const optIns = data.optIns
            return isOptInEnabled && !!optIns?.[featureId]
        }
        if (filter.type === FilterType.audienceMatch) {
            return filterForAudienceMatch({
                operator: filter,
                data,
                featureId,
                isOptInEnabled,
                audiences,
            })
        }
        if (filter.type === FilterType.custom) {
            return checkCustomFilter(data, filter, config)
        }
        if (filter.type !== FilterType.user) {
            console.error(`Invalid filter type: ${filter.type}`)
            return false
        }

        if (!filter.subType) {
            throw new Error('Non-existent filter subType')
        }

        if (!filterFunctionsBySubtype[filter.subType]) {
            console.error(`Invalid filter subType: ${filter.subType}`)
            return false
        }

        return filterFunctionsBySubtype[filter.subType](data, filter)
    }

    if (operator.operator === 'or') {
        for (const filter of operator.filters) {
            if (await doesUserPassFilter(filter)) {
                return true
            }
        }
        return false
    } else {
        for (const filter of operator.filters) {
            if (!(await doesUserPassFilter(filter))) {
                return false
            }
        }
        return true
    }
}
type FilterFunctionsBySubtype = {
    [key in UserSubType]: (
        data: any,
        filter: AudienceFilterOrOperator,
    ) => boolean
}

function filterForAudienceMatch({
    operator,
    data,
    featureId,
    isOptInEnabled,
    audiences = {},
}: {
    operator: AudienceFilterOrOperator
    data: any
    featureId: string
    isOptInEnabled: boolean
    audiences?: { [id: string]: Omit<PublicAudience<string>, '_id'> }
}): Promise<boolean> { // Change return type to Promise<boolean>
    if (!operator?._audiences) return Promise.resolve(false);
    const comparator = operator.comparator;
    // Use async/await and Promise.all for concurrent evaluation
    return Promise.all(operator._audiences.map(async (_audience) => {
        const audience = audiences[_audience];
        if (!audience) {
            console.error('Invalid audience referenced by audienceMatch filter.');
            return false;
        }
        return await evaluateOperator({
            operator: audience.filters,
            data,
            featureId,
            isOptInEnabled,
            audiences,
            config: {} as ConfigBody
        });
    })).then(results => {
        return comparator === '=' ? results.some(Boolean) : !results.some(Boolean);
    });
}

const filterFunctionsBySubtype: FilterFunctionsBySubtype = {
    country: (data, filter) => checkStringsFilter(data.country, filter),
    email: (data, filter) => checkStringsFilter(data.email, filter),
    ip: (data, filter) => checkStringsFilter(data.ip, filter),
    user_id: (data, filter) => checkStringsFilter(data.user_id, filter),
    appVersion: (data, filter) => checkVersionFilters(data.appVersion, filter),
    platformVersion: (data, filter) =>
    checkVersionFilters(data.platformVersion, filter),
    deviceModel: (data, filter) => checkStringsFilter(data.deviceModel, filter),
    platform: (data, filter) => checkStringsFilter(data.platform, filter),
    customData: (data, filter) => {
        const combinedCustomData = {
            ...data.customData,
            ...data.privateCustomData,
        }
        return checkCustomData(combinedCustomData, filter)
    },
}

export const convertToSemanticVersion = (version: string): string => {
    const splitVersion = version.split('.')
    if (splitVersion.length < 2) {
        splitVersion.push('0')
    }
    if (splitVersion.length < 3) {
        splitVersion.push('0')
    }

    splitVersion.forEach((value, index) => {
        if (value === '') {
            splitVersion[index] = '0'
        }
    })
    return splitVersion.join('.')
}

export const checkVersionValue = (
    filterVersion: string,
    version: string,
    operator?: string,
): boolean => {
    if (filterVersion?.length > 0) {
        const result = versionCompare(version, filterVersion, {
            zeroExtend: true,
        })
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
    version: string,
    filterVersions: unknown[] | null,
    operator?: string,
): boolean => {
    let parsedOperator = operator
    let parsedVersion = version

    if (!parsedVersion) {
        return false
    }

    if (!filterVersions) {
        return false
    }

    let filterVersionsTemp: string[] = filterVersions.filter(
        (val) => typeof val === 'string',
    ) as string[]

    let not = false
    if (parsedOperator === '!=') {
        parsedOperator = '='
        not = true
    }

    for (const v of filterVersionsTemp) {
        if (typeof v !== 'string') {
            return false
        }
    }

    if (parsedOperator !== '=') {
        // remove any non-number and . characters, and remove everything after a hyphen
        // eg. 1.2.3a-b6 becomes 1.2.3
        const regex1 = new RegExp(/[^(\d|.|\-)]/g)
        const regex2 = new RegExp(/-.*/g)
        parsedVersion = parsedVersion.replace(regex1, '').replace(regex2, '')
        filterVersionsTemp = filterVersionsTemp.map((filterVersion) =>
            filterVersion.replace(regex1, '').replace(regex2, ''),
        )
    }
    parsedVersion = convertToSemanticVersion(parsedVersion)
    const passed = filterVersionsTemp.some((v) =>
        checkVersionValue(v, parsedVersion, operator),
    )
    return !not ? passed : !passed
}

export const checkNumberFilter = (
    num: unknown,
    filterNums: unknown[] | null,
    operator?: string,
): boolean => {
    if (isString(operator)) {
        switch (operator) {
            case 'exist':
                return isNumber(num) && !isNaN(num)
            case '!exist':
                return !(isNumber(num) && !isNaN(num))
        }
    }

    if (!filterNums) {
        return false
    }

    if (isNumber(num) && !isNaN(num)) {
        if (operator === '!=') {
            return filterNums.every((filterNum) => {
                if (!(isNumber(filterNum) && !isNaN(filterNum))) {
                    return false
                }
                return num !== filterNum
            })
        } else {
            return filterNums.some((filterNum) => {
                if (!(isNumber(filterNum) && !isNaN(filterNum))) {
                    return false
                }
                switch (operator) {
                    case '=':
                        return num === filterNum
                    case '>':
                        return num > filterNum
                    case '>=':
                        return num >= filterNum
                    case '<':
                        return num < filterNum
                    case '<=':
                        return num <= filterNum
                }
                return false
            })
        }
    }
    return false
}

export const checkNumbersFilter = (
    number: unknown,
    filter: AudienceFilterOrOperator,
): boolean => {
    const parsedNumber = isString(number) ? Number(number) : number
    const operator = filter.comparator
    const values = getFilterValues(filter)
    return checkNumberFilter(parsedNumber, values, operator)
}

export const checkStringsFilter = (
    string: unknown,
    filter: AudienceFilterOrOperator,
): boolean => {
    const operator = filter.comparator
    const values = getFilterValues(filter)

    switch (operator) {
        case '=':
            return !!values && isString(string) && includes(values, string)
        case '!=':
            return !!values && isString(string) && !includes(values, string)
        case 'exist':
            return isString(string) && string !== ''
        case '!exist':
            return !isString(string) || string === ''
        case 'contain':
            return (
                !!values &&
                isString(string) &&
                !!find(values, (value) => includes(string, value))
            )
        case '!contain':
            return (
                !!values &&
                (!isString(string) ||
                    !find(values, (value) => includes(string, value)))
            )
        case 'startWith':
            return (
                !!values &&
                isString(string) &&
                !!find(
                    values,
                    (value) => isString(value) && string.startsWith(value),
                )
            )
        case '!startWith':
            return (
                !!values &&
                (!isString(string) ||
                    !find(
                        values,
                        (value) =>
                            isString(value) &&
                            string.startsWith(value as string),
                    ))
            )
        case 'endWith':
            return (
                !!values &&
                isString(string) &&
                !!find(
                    values,
                    (value) =>
                        isString(value) && string.endsWith(value as string),
                )
            )
        case '!endWith':
            return (
                !!values &&
                (!isString(string) ||
                    !find(
                        values,
                        (value) =>
                            isString(value) && string.endsWith(value as string),
                    ))
            )
    }
    return isString(string)
}

export const checkBooleanFilter = (
    bool: unknown,
    filter: AudienceFilterOrOperator,
): boolean => {
    const operator = filter.comparator
    const values = getFilterValues(filter)
    switch (operator) {
        case 'contain':
        case '=':
            return !!values && isBoolean(bool) && includes(values, bool)
        case '!contain':
        case '!=':
            return !!values && isBoolean(bool) && !includes(values, bool)
        case 'exist':
            return isBoolean(bool)
        case '!exist':
            return !isBoolean(bool)
    }

    return false
}

export const checkVersionFilters = (
    appVersion: string,
    filter: AudienceFilterOrOperator,
): boolean => {
    const parsedAppVersion = appVersion
    const operator = filter.comparator
    const values = getFilterValues(filter)
    // dont need to do semver if they're looking for an exact match. Adds support for non semver versions.
    if (operator === '=') {
        return checkStringsFilter(parsedAppVersion, filter)
    } else {
        return checkVersionFilter(parsedAppVersion, values, operator)
    }
}

export const checkCustomData = (
    data: Record<string, unknown>,
    filter: AudienceFilterOrOperator,
): boolean => {
    const values = getFilterValues(filter)
    const operator = filter.comparator

    if (filter.dataKey && isString(filter.dataKey)) {
        const customData = data || {}

        const firstValue = values && values[0]
        const dataValue = customData[filter.dataKey]
        if (operator === 'exist') {
            return checkValueExists(dataValue)
        } else if (operator === '!exist') {
            return !checkValueExists(dataValue)
        } else if (isString(firstValue) && isString(dataValue)) {
            return checkStringsFilter(dataValue, filter)
        } else if (isNumber(firstValue) && isNumber(dataValue)) {
            return checkNumbersFilter(dataValue, filter)
        } else if (isBoolean(firstValue) && isBoolean(dataValue)) {
            return checkBooleanFilter(dataValue, filter)
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

export const getFilterValues = (
    filter: AudienceFilterOrOperator,
): unknown[] | null => {
    const values = isArray(filter.values)
        ? (filter.values as unknown[]).filter(
              (val: unknown) => !(val === null || val === undefined),
          )
        : null
    if (values && values.length > 0) {
        return values
    } else {
        return null
    }
}

export const parseUserAgent = (
    uaString?: string,
): {
    browser?: string
    browserDeviceType?: string
} => {
    // Note: Anything that is not in this map will return Desktop
    const DEVICES_MAP: Record<string, string> = {
        mobile: 'Mobile',
        tablet: 'Tablet',
    }

    // Note: Anything that is not in this map will return Other
    const BROWSER_MAP: Record<string, string> = {
        Chrome: 'Chrome',
        'Chrome Headless': 'Chrome',
        'Chrome WebView': 'Chrome',
        Chromium: 'Chrome',
        Firefox: 'Firefox',
        Safari: 'Safari',
        'Mobile Safari': 'Safari',
    }

    if (!uaString) {
        return {
            browser: undefined,
            browserDeviceType: undefined,
        }
    }

    const parser = new UAParser(uaString)

    return {
        browser: BROWSER_MAP[parser.getBrowser().name || ''] || 'Other',
        browserDeviceType:
            DEVICES_MAP[parser.getDevice().type || ''] || 'Desktop',
    }
}

/**
 * Returns true if the given value is not a type we define as "nonexistent" (NaN, empty string etc.)
 * Used only for values we don't have a specific datatype for (eg. customData values)
 * If value has a datatype, use one of the type checkers above (eg. checkStringFilter)
 * NOTE: The use of Number.isNaN is required over the global isNaN as the check it performs is more specific
 * @param value
 * @returns {boolean}
 */
function checkValueExists(value: unknown): boolean {
    return (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !Number.isNaN(value)
    )
}

export async function checkCustomFilter(
    data: any,
    filter: AudienceFilterOrOperator,
    config: ConfigBody
): Promise<boolean> {
    if (!filter.customFilter) {
        console.error('Custom filter is missing data')
        return false
    }

    const bucketingWorkerEnabled = config.project.settings.customBucketingWorker?.enabled
    const workerName = config.project.settings.customBucketingWorker?.name
    if (!bucketingWorkerEnabled || !workerName) {
        console.error('Custom bucketing worker is not configured')
        return false
    }

    const placeholderURL = 'https://example.com/custom-filter' // Replace with actual URL

    try {
        const response = await fetch(placeholderURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: data,
                data: filter.customFilter,
                name: workerName,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result.passed === true
    } catch (error) {
        console.error('Error evaluating custom filter:', error)
        return false
    }
}
