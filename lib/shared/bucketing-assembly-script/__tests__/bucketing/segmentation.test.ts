import * as assert from 'assert'
import {
    evaluateOperatorFromJSON,
    setPlatformData
} from '../bucketingImportHelper'

const defaultPlatformData = {
    platform: '',
    platformVersion: '',
    sdkType: '',
    sdkVersion: '',
    deviceModel: ''
}

const setPlatformDataJSON = (data: unknown) => {
    setPlatformData(JSON.stringify(data))
}

const evaluateOperator = (
    { operator, data, audiences = {} }:
    { operator: unknown, data: Record<string, unknown>, audiences?: Record<string, unknown>}
) => {
    // set required field to make class constructors happy
    data.user_id ||= 'some_user'
    return evaluateOperatorFromJSON(
        JSON.stringify(operator),
        JSON.stringify(data),
        JSON.stringify(audiences)
    )
}

const checkStringsFilter = (string: unknown, filter: { values?: unknown[], comparator: string }) => {
    const emailFilter = {
        type: 'user',
        subType: 'email',
        values: [],
        ...filter
    }

    const operator = {
        'filters': [emailFilter],
        'operator': 'and'
    }

    const data = { email: string, user_id: 'some_user' }

    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(data))
}
const checkBooleanFilter = (bool: unknown, filter: { values?: unknown[], comparator: string }) => {
    const customDataFilter = {
        dataKey: 'key',
        type: 'user',
        subType: 'customData',
        dataKeyType: 'Boolean',
        values: [],
        ...filter
    }

    const operator = {
        'filters': [customDataFilter],
        'operator': 'and'
    }

    const data = { customData: { key: bool }, user_id: 'some_user' }

    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(data))
}

const checkNumbersFilter = (number: unknown, filter: { values?: unknown[], comparator: string }): boolean => {
    const customDataFilter = {
        dataKey: 'key',
        type: 'user',
        subType: 'customData',
        dataKeyType: 'Number',
        values: [],
        ...filter
    }

    const operator = {
        'filters': [customDataFilter],
        'operator': 'and'
    }

    const data = { customData: { key: number }, user_id: 'some_user' }
    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(data))
}
const checkVersionFilters = (appVersion: string, filter: { values?: unknown[], comparator: string }): boolean => {
    const appVersionFilter = {
        type: 'user',
        subType: 'appVersion',
        values: [],
        ...filter
    }

    const operator = {
        'filters': [appVersionFilter],
        'operator': 'and'
    }

    const data = { appVersion: appVersion, user_id: 'some_user' }
    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(data))
}

const checkVersionFilter = (appVersion: string, values: string[], comparator: string): boolean => {
    return checkVersionFilters(appVersion, { values, comparator })
}

const checkCustomData = (data: Record<string, unknown> | null, filter: unknown): boolean => {
    const operator = {
        'filters': [filter],
        'operator': 'and'
    }

    const user = { customData: data, user_id: 'some_user' }
    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(user))
}

describe('SegmentationManager Unit Test', () => {
    beforeEach(() => {
        setPlatformDataJSON(defaultPlatformData)
    })

    describe('evaluateOperator', () => {
        it('should fail for empty filters', () => { // GO: YES
            const filters: Record<string, unknown>[] = []

            const operator = {
                filters,
                operator: 'and'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }
            assert.strictEqual(false, evaluateOperator({ data, operator }))
            const orOp = {
                filters,
                operator: 'or'
            }
            assert.strictEqual(false, evaluateOperator({ data: {}, operator: orOp }))
        })

        it('should pass for all filter', () => { // GO: YES
            const filters = [{
                type: 'all',
                comparator: '=',
                values: []
            }]

            const operator = {
                filters,
                operator: 'and'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        describe('evaluateOperator should handle optIn filter', () => { // GO: NO
            const filters = [{
                type: 'optIn',
                comparator: '=',
                values: []
            }]

            const optInOperator = {
                filters,
                operator: 'and'
            }

            const optInData = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }
            it('should fail optIn filter when feature in optIns and isOptInEnabled ', () => {
                assert.strictEqual(
                    false,
                    evaluateOperator({
                        data: optInData, operator: optInOperator
                    })
                )
            })
        })

        describe('evaluateOperator should handle a new filter (myNewFilter) type', () => { // GO: YES
            const filters = [{
                type: 'myNewFilter',
                comparator: '=',
                values: []
            }]

            const operator = {
                filters,
                operator: 'and'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }
            it('should fail myNewFilter filter', () => {
                assert.strictEqual(false, evaluateOperator({ data, operator }))
            })
        })

        describe('evaluateOperator should handle a new operator (xylophone) type', () => { // GO: YES
            const filters = [{
                type: 'user',
                subType: 'email',
                comparator: '=',
                values: ['brooks@big.lunch']
            }]

            const operator = {
                filters,
                operator: 'xylophone'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }
            it('should fail xylophone operator', () => {
                assert.strictEqual(false, evaluateOperator({ data, operator }))
            })
        })

        describe('evaluateOperator should handle audienceMatch filter', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ]
            const operator = {
                filters,
                operator: 'and'
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS'
            }
            const audienceMatchOperator = {
                filters: [
                    {
                        type: 'audienceMatch',
                        comparator: '=',
                        _audiences: ['test']
                    }
                ],
                operator: 'and'
            }
            const audienceMatchOperatorNotEqual = {
                filters: [
                    {
                        type: 'audienceMatch',
                        comparator: '!=',
                        _audiences: ['test']
                    }
                ],
                operator: 'and'
            }

            it('should pass seg for an AND operator', () => { // GO: YES
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    }
                }
                assert.strictEqual(true, evaluateOperator({
                    data,
                    operator: audienceMatchOperator,
                    audiences
                }))
            })

            it('should pass seg for a nested audience match filter', () => { // GO: NO?
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    }
                }
                const parentOperator = {
                    operator: 'and',
                    filters: [audienceMatchOperator, operator]
                }
                assert.strictEqual(true, evaluateOperator({
                    data,
                    operator: parentOperator,
                    audiences
                }))
            })

            it('should not pass seg when referenced audience does not exist', () => { // GO: YES
                assert.strictEqual(false, evaluateOperator({
                    data,
                    operator: audienceMatchOperator,
                    audiences: {}
                }))
            })

            it('should not pass seg when not in audience for an AND operator', () => {
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    }
                }

                assert.strictEqual(false, evaluateOperator({
                    data,
                    operator: audienceMatchOperatorNotEqual,
                    audiences
                }))
            })

            it('should pass seg for nested audiences', () => { // GO: NO?
                const nestedAudienceMatchOperator = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '=',
                            _audiences: ['nested']
                        }
                    ],
                    operator: 'and'
                }

                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    },
                    'nested': {
                        _id: 'nested',
                        filters: audienceMatchOperator
                    }
                }

                assert.strictEqual(true, evaluateOperator({
                    data,
                    operator: nestedAudienceMatchOperator,
                    audiences
                }))
            })

            it('should not pass seg for nested audiences with !=', () => { // GO: NO?
                const nestedAudienceMatchOperator = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '!=',
                            _audiences: ['nested']
                        }
                    ],
                    operator: 'and'
                }
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    },
                    'nested': {
                        _id: 'nested',
                        filters: audienceMatchOperator
                    }
                }

                assert.strictEqual(false, evaluateOperator({
                    data,
                    operator: nestedAudienceMatchOperator,
                    audiences
                }))
            })

            it('should pass seg for an AND operator with multiple values', () => { // GO: NO?
                const filters = [
                    { type: 'user', subType: 'country', comparator: '=', values: ['USA'] },
                ]
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    },
                    'test2': {
                        _id: 'test2',
                        filters: {
                            filters,
                            operator: 'and'
                        }
                    }
                }
                const audienceMatchOperatorMultiple = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '=',
                            _audiences: ['test', 'test2']
                        }
                    ],
                    operator: 'and'
                }

                assert.strictEqual(true, evaluateOperator({
                    data,
                    operator: audienceMatchOperatorMultiple,
                    audiences
                }))
            })

            it('should not pass seg for an AND operator with multiple values', () => { // GO: NO?
                const filters = [
                    { type: 'user', subType: 'country', comparator: '=', values: ['USA'] },
                ]
                const audiences = {
                    'test': {
                        _id: 'test',
                        filters: operator
                    },
                    'test2': {
                        _id: 'test2',
                        filters: {
                            filters,
                            operator: 'and'
                        }
                    }
                }
                const audienceMatchOperatorMultiple = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '!=',
                            _audiences: ['test', 'test2']
                        }
                    ],
                    operator: 'and'
                }
                assert.strictEqual(false, evaluateOperator({
                    data,
                    operator: audienceMatchOperatorMultiple,
                    audiences
                }))
            })
        })

        describe('evaluateOperator should handle a new user sub-filter (myNewFilter) type', () => { // GO: YES
            const filters = [{
                type: 'user',
                subType: 'myNewFilter',
                comparator: '=',
                values: []
            }]
            const operator = {
                filters,
                operator: 'and'
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }

            it('should fail for user filter with subType of myNewFilter', () => {
                assert.strictEqual(false, evaluateOperator({ data, operator }))
            })
        })

        describe('evaluateOperator should handle a new comparator type', () => { // GO: Partial
            const filters = [{
                type: 'user',
                subType: 'email',
                comparator: 'wowNewComparator',
                values: []
            }, { // GO Missing this check
                type: 'audienceMatch',
                _audiences: [],
                comparator: 'wowNewComparator'
            }]
            const operator = {
                filters,
                operator: 'and'
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS'
            }

            it('should fail for user and audienceMatch filters with comparator of myNewFilter', () => {
                assert.strictEqual(false, evaluateOperator({ data, operator }))
            })
        })

        it('should work for an AND operator', () => { // GO: YES
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ]

            const operator = {
                filters,
                operator: 'and'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should work for a top level AND with nested AND operator', () => { // GO: YES
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ]

            const topLevelFilter = { type: 'user', subType: 'country', comparator: '!=', values: ['Nanada'] }
            const nestedOperator = {
                filters,
                operator: 'and'
            }

            const operator = {
                filters: [topLevelFilter, nestedOperator],
                operator: 'and'
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should work for an OR operator', () => { // GO: YES
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ]

            const operator = {
                filters,
                operator: 'or'
            }

            const data = {
                country: 'whomp',
                email: 'fake@email.com',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should work for a nested OR operator', () => { // GO: YES
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ]

            const nestedOperator = {
                filters,
                operator: 'or'
            }

            const operator = {
                filters: [nestedOperator, { type: 'user', subType: 'country', comparator: '=', values: ['Nanada'] }],
                operator: 'or'
            }
            const data = {
                country: 'whomp',
                email: 'fake@email.com',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should work for an AND operator containing a custom data filter', () => { // GO: YES
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                {
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'something',
                    comparator: '!=',
                    values: ['Canada'],
                    dataKeyType: 'String'
                }
            ]

            const operator = {
                filters,
                operator: 'and'
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                appVersion: '2.0.0',
                platform: 'iOS'
            }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for customData filter != multiple values', () => { // GO: YES
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '!=',
                    values: ['dataValue', 'dataValue2']
                }],
                operator: 'and'
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.strictEqual(false, evaluateOperator({ data, operator }))
        })

        it('should pass for private customData filter != multiple values', () => { // GO: YES
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '!=',
                    values: ['dataValue', 'dataValue2']
                }],
                operator: 'and'
            }

            const data = { privateCustomData: { testKey: 'dataValue' } }
            assert.strictEqual(false, evaluateOperator({ data, operator }))
        })

        it('should pass for customData filter does not contain multiple values', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '!contain',
                    values: ['dataValue', 'otherValue']
                }],
                operator: 'and'
            }

            const data = { customData: { testKey: 'otherValue' } }
            assert.strictEqual(false, evaluateOperator({ data, operator }))
        })

        it('should pass for user_id filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'user_id',
                    comparator: '=',
                    values: ['test_user']
                }],
                operator: 'and'
            }

            const data = { user_id: 'test_user' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for email filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['test@devcycle.com']
                }],
                operator: 'and'
            }

            const data = { email: 'test@devcycle.com' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for country filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['CA']
                }],
                operator: 'and'
            }

            const data = { country: 'CA' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for appVersion filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '=',
                    values: ['1.0.1']
                }],
                operator: 'and'
            }

            const data = { appVersion: '1.0.1' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for platformVersion filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'platformVersion',
                    comparator: '>=',
                    values: ['15.1']
                }],
                operator: 'and'
            }

            const data = {}
            setPlatformDataJSON({ ...defaultPlatformData, platformVersion: '15.1' })
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for platform filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'platform',
                    comparator: '=',
                    values: ['iOS', 'iPadOS', 'tvOS']
                }],
                operator: 'and'
            }

            const data = {}
            setPlatformDataJSON({ ...defaultPlatformData, platform: 'iOS' })
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for deviceModel filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'deviceModel',
                    comparator: '=',
                    values: ['Samsung Galaxy F12']
                }],
                operator: 'and'
            }

            const data = { deviceModel: 'Samsung Galaxy F12' }

            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for customData filter', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '=',
                    values: ['dataValue']
                }],
                operator: 'and'
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for customData filter != multiple values', () => { // GO: NO
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '!=',
                    values: ['dataValue', 'dataValue2']
                }],
                operator: 'and'
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.strictEqual(false, evaluateOperator({ data, operator }))
        })
    })

    describe('checkStringsFilter', () => { // GO: NO
        it('should return false if filter and no valid value', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] }
            assert.strictEqual(false, checkStringsFilter(null, filter))
        })

        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(false, checkStringsFilter(null, filter))
            assert.strictEqual(false, checkStringsFilter('', filter))
        })

        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(true, checkStringsFilter('string', filter))
        })

        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(true, checkStringsFilter(null, filter))
            assert.strictEqual(true, checkStringsFilter('', filter))
        })

        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(false, checkStringsFilter('string', filter))
        })

        it('should return false if contains filter and no value', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] }
            assert.strictEqual(false, checkStringsFilter(null, filter))
        })

        it('should return true if browser filter works', () => {
            const filter = { type: 'user', comparator: '=', values: ['Chrome'] }
            assert.strictEqual(true, checkStringsFilter('Chrome', filter))
        })

        it('should return true if string filter works with non string value in values', () => {
            const filter = { type: 'user', comparator: '=', values: ['Chrome', 0] }
            assert.strictEqual(true, checkStringsFilter('Chrome', filter))
        })

        it('should return true if browser device type filter works', () => {
            const filter = { type: 'user', comparator: '=', values: ['Desktop'] }
            assert.strictEqual(true, checkStringsFilter('Desktop', filter))
        })

        it('should return true if contains filter and value contains', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] }
            assert.strictEqual(true, checkStringsFilter('helloWorld', filter))
        })

        it('should return false if contains filter and value does not contain', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] }
            assert.strictEqual(false, checkStringsFilter('xy', filter))
        })

        it('should return true if not contains filter and no value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] }
            assert.strictEqual(true, checkStringsFilter(null, filter))
        })

        it('should return true if not contains filter and value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] }
            assert.strictEqual(true, checkStringsFilter('xy', filter))
        })

        it('should return false if not contains filter and not value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] }
            assert.strictEqual(false, checkStringsFilter('hello', filter))
        })

        it('should return false if string is not a string', () => {
            assert.strictEqual(false, checkStringsFilter(1, { comparator: '=' }))
        })

        it('should return false if filter value is not a string', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] }
            assert.strictEqual(false, checkStringsFilter('Male', filter))
        })

        it('should return true if string is equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] }
            assert.strictEqual(true, checkStringsFilter('Male', filter))
        })

        it('should return false if string is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] }
            assert.strictEqual(false, checkStringsFilter('Female', filter))
        })

        it('should return true if string is one of multiple values', () => {
            const filter = { type: 'user', comparator: '=', values: ['iPhone OS', 'Android'] }
            assert.strictEqual(true, checkStringsFilter('iPhone OS', filter))
        })

        it('should return true if string is not one of multiple values', () => {
            const filter = { type: 'user', comparator: '!=', values: ['iPhone OS', 'Android', 'Android TV', 'web'] }
            assert.strictEqual(true, checkStringsFilter('Roku', filter))
        })

        it('should return true if string is equal to multiple filters', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'country', comparator: '!=', values: ['Not Canada'] }
            ]

            const operator = {
                filters,
                operator: 'and'
            } as unknown

            assert.strictEqual(true, evaluateOperator({ data: { country: 'Canada' }, operator }))
        })

        it('should return false if string is not equal to multiple filters', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'country', comparator: '=', values: ['Not Canada'] }
            ]

            const operator = {
                filters,
                operator: 'and'
            } as unknown

            assert.strictEqual(false, evaluateOperator({ data: { country: 'Canada' }, operator }))
        })
    })

    describe('checkBooleanFilter', () => { // GO: NO
        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(false, checkBooleanFilter(null, filter))
        })

        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(true, checkBooleanFilter(true, filter))
            assert.strictEqual(true, checkBooleanFilter(false, filter))
            assert.strictEqual(true, checkBooleanFilter(10, filter))
        })

        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(true, checkBooleanFilter(null, filter))
        })

        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(false, checkBooleanFilter(true, filter))
            assert.strictEqual(false, checkBooleanFilter(false, filter))
        })

        it('should return false if filters value is not a boolean', () => {
            const filter = { type: 'user', comparator: '=', values: ['hi1', 'hi2'] }
            assert.strictEqual(false, checkBooleanFilter(true, filter))
        })

        it('should return true if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] }
            assert.strictEqual(true, checkBooleanFilter(true, filter))
        })

        it('should return true if filters values contains boolean value and non boolean value', () => {
            const filter = { type: 'user', comparator: '=', values: [true, 'test'] }
            assert.strictEqual(true, checkBooleanFilter(true, filter))
        })

        it('should return false if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] }
            assert.strictEqual(false, checkBooleanFilter(false, filter))
        })

        it('should return false if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] }
            assert.strictEqual(false, checkBooleanFilter(true, filter))
        })

        it('should return true if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] }
            assert.strictEqual(true, checkBooleanFilter(false, filter))
        })
    })

    describe('checkNumbersFilter', () => { // GO: YES
        it('should return false if exists filter and no number', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(false, checkNumbersFilter(null as unknown as number, filter))
        })

        it('should return true if exists filter and number', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.strictEqual(true, checkNumbersFilter(10, filter))
        })

        it('should return true if not exists filter and no number', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(true, checkNumbersFilter(null as unknown as number, filter))
        })

        it('should return false if not exists filter and number', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.strictEqual(false, checkNumbersFilter(10, filter))
        })

        it('should return false if filter value is not a number', () => {
            const filter = { type: 'user', comparator: '=', values: ['hi1', 'hi2'] }
            assert.strictEqual(false, checkNumbersFilter(10, filter))
        })

        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] }
            assert.strictEqual(true, checkNumbersFilter(12, filter))
        })

        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] }
            assert.strictEqual(true, checkNumbersFilter(12, filter))
        })

        it('should return true if number is equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            assert.strictEqual(true, checkNumbersFilter(10, filter))
        })

        it('should return true if number is in values array with non-number values', () => {
            const filter = { type: 'user', comparator: '=', values: [10, 'test'] }
            assert.strictEqual(true, checkNumbersFilter(10, filter))
        })

        it('should return false if number is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            assert.strictEqual(false, checkNumbersFilter(11, filter))
        })

        it('should return false if number is equal to a OR values', () => {
            const filter = { type: 'user', comparator: '=', values: [10, 11] }
            assert.strictEqual(true, checkNumbersFilter(11, filter))
        })

        it('should return true if values are equal', () => {
            const filter = { type: 'user', comparator: '=', values: [0] }
            const filter2 = { type: 'user', comparator: '=', values: [10] }
            const filter3 = { type: 'user', comparator: '=', values: [0, 10] }

            assert.strictEqual(true, checkNumbersFilter(0, filter))
            assert.strictEqual(true, checkNumbersFilter(10, filter2))
            assert.strictEqual(true, checkNumbersFilter(10, filter3))
        })

        it('should return false if values are not equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            const filter2 = { type: 'user', comparator: '=', values: [-10, -12] }

            assert.strictEqual(false, checkNumbersFilter(0, filter))
            assert.strictEqual(false, checkNumbersFilter(10, filter2))
        })

        it('should return true if values are not equal', () => {
            const filter = { type: 'user', comparator: '!=', values: [10] }
            const filter2 = { type: 'user', comparator: '!=', values: [-10, -12] }

            assert.strictEqual(true, checkNumbersFilter(0, filter))
            assert.strictEqual(true, checkNumbersFilter(10, filter2))
        })

        it('should return true if values are not equal', () => {
            const filter = { type: 'user', comparator: '!=', values: [10] }
            assert.strictEqual(false, checkNumbersFilter(10, filter))
        })

        it('should return true if values are greater than', () => {
            const filter = { type: 'user', comparator: '>', values: [-1] }
            const filter2 = { type: 'user', comparator: '>', values: [1, 5] }
            assert.strictEqual(true, checkNumbersFilter(0, filter))
            assert.strictEqual(true, checkNumbersFilter(10, filter2))
        })

        it('should return false if values are not greater than', () => {
            const filter = { type: 'user', comparator: '>', values: [10] }
            const filter2 = { type: 'user', comparator: '>', values: [10] }
            assert.strictEqual(false, checkNumbersFilter(0, filter))
            assert.strictEqual(false, checkNumbersFilter(10, filter2))
        })

        it('should return true if values are greater than or equal', () => {
            const filter = { type: 'user', comparator: '>=', values: [-1] }
            const filter2 = { type: 'user', comparator: '>=', values: [1] }
            const filter3 = { type: 'user', comparator: '>=', values: [10] }

            assert.strictEqual(true, checkNumbersFilter(0, filter))
            assert.strictEqual(true, checkNumbersFilter(10, filter2))
            assert.strictEqual(true, checkNumbersFilter(10, filter3))
        })

        it('should return false if values are not greater than or equal', () => {
            const filter = { type: 'user', comparator: '>=', values: [10] }
            const filter2 = { type: 'user', comparator: '>=', values: [11] }

            assert.strictEqual(false, checkNumbersFilter(0, filter))
            assert.strictEqual(false, checkNumbersFilter(10, filter2))
        })

        it('should return true if values are less than', () => {
            const filter = { type: 'user', comparator: '<', values: [0] }
            const filter2 = { type: 'user', comparator: '<', values: [10] }

            assert.strictEqual(true, checkNumbersFilter(-1, filter))
            assert.strictEqual(true, checkNumbersFilter(1, filter2))
        })

        it('should return false if values are not less than', () => {
            const filter = { type: 'user', comparator: '<', values: [0] }
            const filter2 = { type: 'user', comparator: '<', values: [10] }

            assert.strictEqual(false, checkNumbersFilter(10, filter))
            assert.strictEqual(false, checkNumbersFilter(10, filter2))
        })

        it('should return true if values are less than or equal', () => {
            const filter = { type: 'user', comparator: '<=', values: [0] }
            const filter2 = { type: 'user', comparator: '<=', values: [10] }
            const filter3 = { type: 'user', comparator: '<=', values: [10] }

            assert.strictEqual(true, checkNumbersFilter(-1, filter))
            assert.strictEqual(true, checkNumbersFilter(1, filter2))
            assert.strictEqual(true, checkNumbersFilter(10, filter3))
        })

        it('should return false if values are not less than or equal', () => {
            const filter = { type: 'user', comparator: '<=', values: [0] }
            const filter2 = { type: 'user', comparator: '<=', values: [10] }

            assert.strictEqual(false, checkNumbersFilter(10, filter))
            assert.strictEqual(false, checkNumbersFilter(11, filter2))
        })
    })

    describe('checkVersionFilters', () => { // GO: YES
        it('should return false if filter and version is null', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2', '1.1.3'] }
            const filter1 = { type: 'user', comparator: '>=', values: ['1.1.2', '1.1.3'] }
            assert.strictEqual(false, checkVersionFilters(null as unknown as string, filter))
            assert.strictEqual(false, checkVersionFilters(null as unknown as string, filter1))
        })

        it('should return true if filter equals version', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2', '1.1.3'] }
            assert.strictEqual(true, checkVersionFilters('1.1.2', filter))
        })

        it('should return true if filter greater than or equals version', () => {
            const filter = { type: 'user', comparator: '>=', values: ['1.1.2', '1.1.3'] }
            assert.strictEqual(true, checkVersionFilters('1.1.2', filter))
        })

        it('should return true if filter equals version non semver', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2.12'] }
            const filter2 = { type: 'user', comparator: '=', values: ['31.331.2222.12'] }
            const filter3 = { type: 'user', comparator: '=', values: ['1.1.2.12.1.2.3'] }
            assert.strictEqual(true, checkVersionFilters('1.1.2.12', filter))
            assert.strictEqual(true, checkVersionFilters('31.331.2222.12', filter2))
            assert.strictEqual(true, checkVersionFilters('1.1.2.12.1.2.3', filter3))
        })

        it('should return false if filter does not equals version', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.1'] }
            assert.strictEqual(false, checkVersionFilters('1.1.2', filter))
        })
    })

    describe('checkVersionFilter', () => { // GO: NO
        it('should return true if string versions equal', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.1'], '='))
        })

        it('should return false if string versions not equal', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['2'], '='))
            assert.strictEqual(false, checkVersionFilter('1', ['2'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.1'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1.1'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1.'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.2.3'], '='))
        })

        it('should return false if string versions not equal', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['1'], '!='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1'], '!='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1.1'], '!='))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1'], '!='))
        })

        it('should return true if string versions not equal', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['2'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.2'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1.1'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.2.3'], '!='))
        })

        it('should return true if string versions greater than', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1', ['1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1', ['2'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.2.3'], '>'))
        })

        it('should return true if string versions greater than', () => {
            assert.strictEqual(true, checkVersionFilter('2', ['1'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2', ['1.1'], '>'))
            assert.strictEqual(true, checkVersionFilter('2.1', ['1.1'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['1.2'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.', ['1.1'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['1.1.1'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['1.2'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['1.2.1'], '>'))
            assert.strictEqual(true, checkVersionFilter('4.8.241', ['4.8'], '>'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4'], '>'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8'], '>'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.2'], '>'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>'))
        })

        it('should return true if string versions greater than or equal', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['2'], '>='))
            assert.strictEqual(false, checkVersionFilter('1', ['2'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.1'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1.1'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.2.3'], '>='))
            assert.strictEqual(false, checkVersionFilter('4.8.241', ['4.9'], '>='))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['5'], '>='))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.9'], '>='))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8.242'], '>='))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8.241.5'], '>='))
        })

        it('should return true if string versions greater than or equal', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('2', ['1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('2.1', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['1.2'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['1.1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['1.2'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['1.2.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4'], '>='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8'], '>='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.2'], '>='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.241.2'], '>='))
        })

        it('should work if version has other characters', () => {
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['v1.2.1-2v3asda'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.2', ['v1.2.1-va1sda'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['v1.2.1-vasd32a'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['v1.2.1-vasda'], '='))
            assert.strictEqual(false, checkVersionFilter('v1.2.1-va21sda', ['v1.2.1-va13sda'], '='))
            assert.strictEqual(false, checkVersionFilter('1.2.0', ['v1.2.1-vas1da'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['v1.2.1- va34sda'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.2.0', ['v1.2.1-vas3da'], '<='))
        })

        it('should return false if string versions less than', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['2'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.2'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1.1'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.2.3'], '<'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['5'], '<'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.9'], '<'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.242'], '<'))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.241.5'], '<'))
        })

        it('should return false if string versions less than', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1', ['1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('2', ['1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2', ['1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('2.1', ['1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['1.2'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.', ['1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['1.1.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2.'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2.1'], '<'))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4'], '<'))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8'], '<'))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8.241'], '<'))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8.241.0'], '<'))
        })

        it('should return false if string versions less than or equal', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1', ['2'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.2'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1.1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.2.3'], '<='))
            assert.strictEqual(true, checkVersionFilter('4.8.241.2', ['4.8.241.2'], '<='))
        })

        it('should return false if string versions less than or equal', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['1'], '<='))
            assert.strictEqual(false, checkVersionFilter('2', ['1'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2', ['1.1'], '<='))
            assert.strictEqual(false, checkVersionFilter('2.1', ['1.1'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['1.2'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.', ['1.1'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['1.1.1'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2.'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.2', ['1.2.1'], '<='))
            assert.strictEqual(false, checkVersionFilter('4.8.241.2', ['4.8.241'], '<='))
        })

        it('should return true if any numbers equal array', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1', '1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1', '1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1', ''], '='))
        })

        it('should return false if all numbers not equal array', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['2', '1.1'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2', '1'], '='))
        })

        it('should return true if any string versions equal array', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1', '1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1', '1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.1', '1.1'], '='))
        })

        it('should return false if all string versions not equal array', () => {
            assert.strictEqual(false, checkVersionFilter(null as unknown as string, ['2', '3'], '='))
            assert.strictEqual(false, checkVersionFilter('1', ['2', '3'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2', '1.2'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.1', '1.2'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1.1', '1.2'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.1', '1.1'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1', '1.1.'], '='))
            assert.strictEqual(false, checkVersionFilter('1.1.1', ['1.2.3', '1.'], '='))
        })

        it('should return false if multiple versions do not equal the version', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['2', '1'], '!='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2', '1.1'], '!='))
        })

        it('should return true if multiple versions do not equal version', () => {
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1.1', '1.2'], '!='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1', '1'], '!='))
        })

        it('should return false if any string versions not greater than array', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['1', '1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1', '1.1.', '1.1'], '>'))
            assert.strictEqual(false, checkVersionFilter('1', ['2'], '>'))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.0'], '>'))
        })

        it('should return true any if string versions greater than array', () => {
            assert.strictEqual(true, checkVersionFilter('2', ['1', '2.0'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.1', ['1.2', '1.2'], '>'))
            assert.strictEqual(true, checkVersionFilter('1.2.', ['1.1', '1.9.'], '>'))
        })

        it('should return false if all string versions not greater than or equal array', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['2', '1.2'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.2'], '>='))
            assert.strictEqual(false, checkVersionFilter('1.1', ['1.1.1', '1.2'], '>='))
        })

        it('should return true if any string versions greater than or equal array', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1', '1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1', '1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.2', '1.1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1'], '>='))
            assert.strictEqual(true, checkVersionFilter('2', ['1', '3'], '>='))
        })

        it('should return true if any string versions less than array', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['2', '1'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.2', '1.5'], '<'))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1'], '<'))
        })

        it('should return false if all string versions less than array', () => {
            assert.strictEqual(false, checkVersionFilter('1', ['1', '1.0'], '<'))
            assert.strictEqual(false, checkVersionFilter('1.1.', ['1.1', '1.1.0'], '<'))
        })

        it('should return true if any string versions less than or equal array', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1', '5'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1', '1.1.'], '<='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1.1', '1.1.'], '<='))
        })

        it('should return false if all string versions not less than or equal array', () => {
            assert.strictEqual(false, checkVersionFilter('2', ['1', '1.9'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.1', ['1.2', '1.2'], '<='))
            assert.strictEqual(false, checkVersionFilter('1.2.', ['1.1', '1.1.9'], '<='))
        })
    })

    describe('checkCustomData', () => { // GO: NO
        const filterStr = {
            comparator: '=',
            dataKey: 'strKey',
            type: 'user',
            subType: 'customData',
            dataKeyType: 'String',
            values: ['value'] as unknown[],
            filters: []
        }

        it('should return false if filter and no data', () => {
            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(false, checkCustomData(data, filterStr))
        })

        it('should return true if string value is equal', () => {
            assert.strictEqual(true, checkCustomData({ strKey: 'value' }, filterStr))
        })

        it('should return true if string is one OR value', () => {
            const filter = { ...filterStr }
            filter.values = ['value', 'value too']
            assert.strictEqual(true, checkCustomData({ strKey: 'value' }, filter))
        })

        it('should return false if string value is not equal', () => {
            assert.strictEqual(false, checkCustomData({ strKey: 'not value' }, filterStr))
        })

        it('should return false if string value isnt present', () => {
            assert.strictEqual(false, checkCustomData({}, filterStr))
        })

        it('should return true if string is not equal to multiple values', () => {
            const filter = { ...filterStr, comparator: '!=', values: ['value1', 'value2', 'value3'] }
            assert.strictEqual(true, checkCustomData({ strKey: 'value' }, filter))
        })

        const filterNum = { ...filterStr }
        filterNum.dataKey = 'numKey'
        filterNum.dataKeyType = 'Number'
        filterNum.values = [0]

        it('should return true if number value is equal', () => {
            assert.strictEqual(true, checkCustomData({ numKey: 0 }, filterNum))
        })

        it('should return true if number is one OR value', () => {
            const filter = { ...filterNum }
            filter.values = [0, 1]
            assert.strictEqual(true, checkCustomData({ numKey: 1 }, filter))
        })

        it('should return false if number value is not equal', () => {
            assert.strictEqual(false, checkCustomData({ numKey: 1 }, filterNum))
        })

        const filterBool = { ...filterStr }
        filterBool.dataKey = 'boolKey'
        filterBool.dataKeyType = 'Boolean'
        filterBool.values = [false]

        it('should return true if bool value is equal', () => {
            assert.strictEqual(true, checkCustomData({ boolKey: false }, filterBool))
        })

        it('should return false if bool value is not equal', () => {
            assert.strictEqual(false, checkCustomData({ boolKey: true }, filterBool))
        })

        it('should return true if all filters are equal', () => {
            const operatorFilter = {
                filters: [filterStr, filterNum, filterBool],
                operator: 'and'
            } as unknown
            assert.strictEqual(true,
                evaluateOperator({
                    data: { customData: { strKey: 'value', numKey: 0, boolKey: false } },
                    operator: operatorFilter
                })
            )
        })

        it('should return false if one custom data key is missing', () => {
            const operatorFilter = {
                filters: [filterStr, filterNum, filterBool],
                operator: 'and'
            } as unknown
            assert.strictEqual(false,
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter
                })
            )
        })

        it('should return true if one custom data key is missing with not equal filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and'
            } as unknown
            assert.strictEqual(true,
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter
                })
            )
        })

        it('should return true if no custom data is provided with not equal filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(true, checkCustomData(data, filter))
        })

        it('should return true if no custom data is provided with not exists filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!exist'

            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(true, checkCustomData(data, filter))
        })

        it('should return false if no custom data is provided with not equal filter and others', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and'
            } as unknown
            assert.strictEqual(false,
                evaluateOperator({
                    data: { customData: null },
                    operator: operatorFilter
                })
            )
        })

        it('should return false if no custom data is provided with not exists filter and others', () => {
            const filter = { ...filterNum }
            filter.comparator = '!exist'
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and'
            } as unknown
            assert.strictEqual(false,
                evaluateOperator({
                    data: { customData: null },
                    operator: operatorFilter
                })
            )
        })

        const containsFilter = {
            comparator: 'contain',
            type: 'user',
            subType: 'customData',
            dataKey: 'last_order_no',
            dataKeyType: 'String',
            values: ['FP']
        }
        it('should return true if custom data contains value', () => {
            assert.strictEqual(true, checkCustomData({ last_order_no: 'FP2423423' }, containsFilter))
        })

        const existsFilter = {
            comparator: 'exist',
            type: 'user',
            subType: 'customData',
            dataKey: 'field',
            dataKeyType: 'String',
            values: []
        }
        it('should return true if custom data value exists', () => {
            assert.strictEqual(true, checkCustomData({ field: 'something' }, existsFilter))
        })

        it('should return false if custom data value does not exist', () => {
            assert.strictEqual(false, checkCustomData({ not_field: 'something' }, existsFilter))
        })
    })

    describe('filterAudiencesFromSubtypes', () => { // GO: NO
        const audiences = [
            {
                '_id': '60cca1d8230f17002542b909',
                'filters': {
                    'filters': [{
                        'values': [
                            'Android',
                            'Fire TV',
                            'Android TV'
                        ],
                        'comparator': '=',
                        'subType': 'platform',
                        'type': 'user'
                    }],
                    'operator': 'and'
                }
            },
            {
                '_id': '60cca1d8230f17002542b910',
                'filters': {
                    'filters': [{
                        'values': [
                            'Fire TV',
                            'Android TV'
                        ],
                        'comparator': '=',
                        'subType': 'platform',
                        'type': 'user'
                    }],
                    'operator': 'and'
                }
            },
            {
                '_id': '60cca1d8230f17002542b911',
                'filters': {
                    'filters': [{
                        'values': [
                            'Android TV'
                        ],
                        'comparator': '=',
                        'subType': 'platform',
                        'type': 'user'
                    }],
                    'operator': 'and'
                }
            },
            {
                '_id': '60cca1d8230f17002542b912',
                'filters': {
                    'filters': [{
                        'values': [
                            'Android'
                        ],
                        'comparator': '=',
                        'subType': 'platform',
                        'type': 'user'
                    }],
                    'operator': 'and'
                }
            },
            {
                '_id': '60cca1d8230f17002542b913',
                'filters': {
                    'filters': [{
                        'values': [
                            'iOS'
                        ],
                        'comparator': '=',
                        'subType': 'platform',
                        'type': 'user'
                    }],
                    'operator': 'and'
                }
            }
        ]

        it('should filter all Android TV audiences properly if it is included in data', () => {
            const data = {}
            setPlatformDataJSON({ ...defaultPlatformData, platform: 'Android TV' })
            const filteredAudiences = audiences.filter((aud) => {
                return evaluateOperator({ operator: aud.filters, data })
            })
            expect(filteredAudiences.length).toEqual(3)
            expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b909')
            expect(filteredAudiences[1]._id).toEqual('60cca1d8230f17002542b910')
            expect(filteredAudiences[2]._id).toEqual('60cca1d8230f17002542b911')
        })

        it('should filter experiment with iOS properly', () => {
            const data = {
                user_id: 'some_id'
            }
            setPlatformDataJSON({ ...defaultPlatformData, platform: 'iOS' })
            const filteredAudiences = audiences.filter((aud) => {
                return evaluateOperator({ operator: aud.filters, data })
            })
            expect(filteredAudiences.length).toEqual(1)
            expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b913')
        })
    })
})
