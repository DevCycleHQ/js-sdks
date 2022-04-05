import * as _ from 'lodash'
import * as assert from 'assert'
import {
    evaluateOperatorFromJSON,
    checkStringsFilterFromJSON,
    checkBooleanFilterFromJSON,
    checkNumbersFilterFromJSON,
    checkNumberFilterFromJSON,
    checkVersionFiltersFromJSON,
    checkVersionFilter,
    checkCustomDataFromJSON,
    // parseUserAgentFromJSON
} from '../build/bucketing-lib.debug'
import {
    Audience,
    AudienceFilterOrOperator,
    TopLevelOperator
} from '../assembly/types'

const evaluateOperator = ({ operator, data }: {operator: TopLevelOperator, data: unknown}) => {
    return evaluateOperatorFromJSON(JSON.stringify(operator), JSON.stringify(data))
}
const checkStringsFilter = (string: string | null, filter: AudienceFilterOrOperator) => {
    return checkStringsFilterFromJSON(string, JSON.stringify(filter))
}
const checkBooleanFilter = (bool: boolean, filter: AudienceFilterOrOperator) => {
    return checkBooleanFilterFromJSON(bool, JSON.stringify(filter))
}
const checkNumbersFilter = (number: number, filter: AudienceFilterOrOperator): boolean => {
    return checkNumbersFilterFromJSON(number, JSON.stringify(filter))
}
const checkNumberFilter = (num: number, filterNums: number[] | null, operator: string | null): boolean => {
    return checkNumberFilterFromJSON(num, JSON.stringify(filterNums), operator)
}
const checkVersionFilters = (appVersion: string, filter: AudienceFilterOrOperator): boolean => {
    return checkVersionFiltersFromJSON(appVersion, JSON.stringify(filter))
}
const checkCustomData = (data: Record<string, unknown>, filter: AudienceFilterOrOperator): boolean => {
    return checkCustomDataFromJSON(JSON.stringify(data), JSON.stringify(filter))
}

describe('SegmentationManager Unit Test', () => {
    // TODO update and uncomment these tests when we incorporate list audiences
    // describe('listAudience filters', () => {
    //     it('passes segmentation for single list audience', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '=',
    //             values: [{
    //                 _listAudience: 'test1',
    //                 version: '2'
    //             }]
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //
    //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
    //     })
    //
    //     it('passes segmentation for multiple value list audience', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '=',
    //             values: [{
    //                 _listAudience: 'test1',
    //                 version: '2'
    //             }, {
    //                 _listAudience: 'test1',
    //                 version: '17'
    //             }]
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //
    //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
    //     })
    //
    //     it('passes segmentation for not in list audience', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '!=',
    //             values: [{
    //                 _listAudience: 'test1',
    //                 version: '14'
    //             }, {
    //                 _listAudience: 'test1',
    //                 version: '17'
    //             }]
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //
    //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(true)
    //     })
    //
    //     it('fails segmentation for not in list audience while IN list audience', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '!=',
    //             values: [{
    //                 _listAudience: 'test1',
    //                 version: '2'
    //             }, {
    //                 _listAudience: 'test1',
    //                 version: '17'
    //             }]
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //
    //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(false)
    //     })
    //
    //     it('fails segmentation for in list audience while NOT IN list audience', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '=',
    //             values: [{
    //                 _listAudience: 'test1',
    //                 version: '14'
    //             }, {
    //                 _listAudience: 'test1',
    //                 version: '17'
    //             }]
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //
    //         expect(segmentation.evaluateFilters({ filters, data: appUser })).toBe(false)
    //     })
    //
    //     it('throws error when filters not prepared', () => {
    //         const filters = [{
    //             _id: 'some_id',
    //             type: 'listAudience',
    //             comparator: '!=',
    //             values: ['test1']
    //         }]
    //         const appUser = {
    //             listAudienceSegmentation: [
    //                 {
    //                     _listAudience: 'test1',
    //                     version: '1'
    //                 }, {
    //                     _listAudience: 'test1',
    //                     version: '2'
    //                 }, {
    //                     _listAudience: 'test2',
    //                     version: '1'
    //                 }]
    //         }
    //         try {
    //             segmentation.evaluateFilters({ filters, data: appUser })
    //         } catch (e) {
    //             expect(e.message).toBe('ListAudience filter must be an object, has not been prepared for segmentation')
    //             return
    //         }
    //
    //         throw new Error()
    //     })
    // })

    describe('evaluateOperator', () => {
        it('should fail for empty filters', () => {
            const filters: Record<string, unknown>[] = []

            const operator: TopLevelOperator = {
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
            const orOp: TopLevelOperator = {
                filters,
                operator: 'or'
            }
            assert.strictEqual(false, evaluateOperator({ data: {}, operator: orOp }))
        })

        it('should pass for all filter', () => {
            const filters = [{
                type: 'all',
                comparator: '=',
                values: []
            }] as AudienceFilterOrOperator[]

            const operator: TopLevelOperator = {
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

        it('should work for an AND operator', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ] as AudienceFilterOrOperator[]

            const operator: TopLevelOperator = {
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

        it('should work for an OR operator', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'email', comparator: '=', values: ['dexter@smells.nice', 'brooks@big.lunch'] },
                { type: 'user', subType: 'appVersion', comparator: '>', values: ['1.0.0'] }
            ] as AudienceFilterOrOperator[]

            const operator: TopLevelOperator = {
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

        it('should work for an AND operator containing a custom data filter', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'customData', datakey: '', comparator: '=', values: ['Canada'] }
            ] as AudienceFilterOrOperator[]

            const operator: TopLevelOperator = {
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

        it('should pass for user_id filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'user_id',
                    comparator: '=',
                    values: ['test_user']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { user_id: 'test_user' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for email filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['test@devcycle.com']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { email: 'test@devcycle.com' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for country filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['CA']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { country: 'CA' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for appVersion filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '=',
                    values: ['1.0.1']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { appVersion: '1.0.1' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for platformVersion filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'platformVersion',
                    comparator: '>=',
                    values: ['15.1']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { platformVersion: '15.1' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for platform filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'platform',
                    comparator: '=',
                    values: ['iOS', 'iPadOS', 'tvOS']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { platform: 'iPadOS' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for deviceModel filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'deviceModel',
                    comparator: '=',
                    values: ['Samsung Galaxy F12']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { deviceModel: 'Samsung Galaxy F12' }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })

        it('should pass for customData filter', () => {
            const operator = {
                filters: [{
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'testKey',
                    dataKeyType: 'String',
                    comparator: '=',
                    values: ['dataValue']
                }] as AudienceFilterOrOperator[],
                operator: 'and'
            } as TopLevelOperator

            const data = { customData: { testKey: 'dataValue' } }
            assert.strictEqual(true, evaluateOperator({ data, operator }))
        })
    })

    describe('checkStringsFilter', () => {
        it('should return false if filter and no value', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter(null, filter))
        })
        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter(null, filter))
            assert.strictEqual(false, checkStringsFilter('', filter))
        })
        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('string', filter))
        })
        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter(null, filter))
            assert.strictEqual(true, checkStringsFilter('', filter))
        })
        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter('string', filter))
        })
        it('should return false if contains filter and no value', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter(null, filter))
        })
        it('should return true if browser filter works', () => {
            const filter = { type: 'user', comparator: '=', values: ['Chrome'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('Chrome', filter))
        })
        it('should return true if browser device type filter works', () => {
            const filter = { type: 'user', comparator: '=', values: ['Desktop'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('Desktop', filter))
        })
        it('should return true if contains filter and value contains', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('helloWorld', filter))
        })
        it('should return false if contains filter and value does not contain', () => {
            const filter = { type: 'user', comparator: 'contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter('xy', filter))
        })
        it('should return true if not contains filter and no value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter(null, filter))
        })
        it('should return true if not contains filter and value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('xy', filter))
        })
        it('should return false if not contains filter and not value', () => {
            const filter = { type: 'user', comparator: '!contain', values: ['hello'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter('hello', filter))
        })

        it('should return false if string is not a string', () => {
            assert.strictEqual(false, checkStringsFilter(1 as unknown as string, {}))
        })
        it('should return false if filter value is not a string', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter('Male', filter))
        })
        it('should return true if string is equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('Male', filter))
        })
        it('should return false if string is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkStringsFilter('Female', filter))
        })
        it('should return true if string is one of multiple values', () => {
            const filter = { type: 'user', comparator: '=', values: ['iPhone OS', 'Android'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkStringsFilter('iPhone OS', filter))
        })
        it('should return true if string is equal to multiple filters', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'country', comparator: '!=', values: ['Not Canada'] }
            ] as AudienceFilterOrOperator[]

            const operator = {
                filters,
                operator: 'AND'
            } as unknown as TopLevelOperator

            assert.strictEqual(true, evaluateOperator({ data: { country: 'Canada' }, operator }))
        })

        it('should return false if string is not equal to multiple filters', () => {
            const filters = [
                { type: 'user', subType: 'country', comparator: '=', values: ['Canada'] },
                { type: 'user', subType: 'country', comparator: '=', values: ['Not Canada'] }
            ] as AudienceFilterOrOperator[]

            const operator = {
                filters,
                operator: 'AND'
            } as unknown as TopLevelOperator

            assert.strictEqual(false, evaluateOperator({ data: { country: 'Canada' }, operator }))
        })
    })

    describe('checkBooleanFilter', () => {
        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkBooleanFilter(null as unknown as boolean, filter))
            assert.strictEqual(false, checkBooleanFilter(10 as unknown as boolean, filter))
        })
        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkBooleanFilter(true, filter))
            assert.strictEqual(true, checkBooleanFilter(false, filter))
        })
        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkBooleanFilter(null as unknown as boolean, filter))
            assert.strictEqual(true, checkBooleanFilter(10 as unknown as boolean, filter))
        })
        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkBooleanFilter(true, filter))
            assert.strictEqual(false, checkBooleanFilter(false, filter))
        })
        it('should return false if filters value is not a boolean', () => {
            const filter = { type: 'user', comparator: '=', values: ['hi1', 'hi2'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkBooleanFilter(true, filter))
        })
        it('should return true if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkBooleanFilter(true, filter))
        })
        it('should return false if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkBooleanFilter(false, filter))
        })
        it('should return false if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkBooleanFilter(true, filter))
        })
        it('should return true if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkBooleanFilter(false, filter))
        })
    })

    describe('checkNumbersFilter', () => {
        it('should return false if filter and no number', () => {
            assert.strictEqual(false, checkNumbersFilter(null as unknown as number, {}))
        })
        it('should return false if exists filter and no number', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkNumbersFilter(null as unknown as number, filter))
            assert.strictEqual(false, checkNumbersFilter('str' as unknown as number, filter))
        })
        it('should return true if exists filter and number', () => {
            const filter = { type: 'user', comparator: 'exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(10, filter))
        })
        it('should return true if not exists filter and no number', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(null as unknown as number, filter))
            assert.strictEqual(true, checkNumbersFilter('str' as unknown as number, filter))
        })
        it('should return false if not exists filter and number', () => {
            const filter = { type: 'user', comparator: '!exist' } as AudienceFilterOrOperator
            assert.strictEqual(false, checkNumbersFilter(10, filter))
        })

        it('should return false if filter value is not a number', () => {
            const filter = { type: 'user', comparator: '=', values: ['hi1', 'hi2'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkNumbersFilter(10, filter))
        })
        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(12, filter))
        })
        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(12, filter))
        })
        it('should return true if number is equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(10, filter))
        })
        it('should return false if number is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkNumbersFilter(11, filter))
        })
        it('should return false if number is equal to a OR values', () => {
            const filter = { type: 'user', comparator: '=', values: [10, 11] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkNumbersFilter(11, filter))
        })
    })

    describe('checkNumberFilter', () => {
        it('should return false if operator is not valid', () => {
            assert.strictEqual(false, checkNumberFilter(0, [0], '=11'))
            assert.strictEqual(false, checkNumberFilter(0, [0], 0 as unknown as string))
        })
        it('should return true if values are equal', () => {
            assert.strictEqual(true, checkNumberFilter(0, [0], '='))
            assert.strictEqual(true, checkNumberFilter(10, [10], '='))
            assert.strictEqual(true, checkNumberFilter(10, [0, 10], '='))
        })
        it('should return false if values are not equal', () => {
            assert.strictEqual(false, checkNumberFilter(0, [10], '='))
            assert.strictEqual(false, checkNumberFilter(10, [-10, -12], '='))
        })
        it('should return true if values are not equal', () => {
            assert.strictEqual(true, checkNumberFilter(0, [10], '!='))
            assert.strictEqual(true, checkNumberFilter(10, [-10, -12], '!='))
        })
        it('should return true if values are not equal', () => {
            assert.strictEqual(false, checkNumberFilter(10, [10], '!='))
        })
        it('should return true if values are greater than', () => {
            assert.strictEqual(true, checkNumberFilter(0, [-1], '>'))
            assert.strictEqual(true, checkNumberFilter(10, [1, 5], '>'))
        })
        it('should return false if values are not greater than', () => {
            assert.strictEqual(false, checkNumberFilter(0, [10], '>'))
            assert.strictEqual(false, checkNumberFilter(10, [10], '>'))
        })
        it('should return true if values are greater than or equal', () => {
            assert.strictEqual(true, checkNumberFilter(0, [-1], '>='))
            assert.strictEqual(true, checkNumberFilter(10, [1], '>='))
            assert.strictEqual(true, checkNumberFilter(10, [10], '>='))
        })
        it('should return false if values are not greater than or equal', () => {
            assert.strictEqual(false, checkNumberFilter(0, [10], '>='))
            assert.strictEqual(false, checkNumberFilter(10, [11], '>='))
        })
        it('should return true if values are less than', () => {
            assert.strictEqual(true, checkNumberFilter(-1, [0], '<'))
            assert.strictEqual(true, checkNumberFilter(1, [10], '<'))
        })
        it('should return false if values are not less than', () => {
            assert.strictEqual(false, checkNumberFilter(10, [0], '<'))
            assert.strictEqual(false, checkNumberFilter(10, [10], '<'))
        })
        it('should return true if values are less than or equal', () => {
            assert.strictEqual(true, checkNumberFilter(-1, [0], '<='))
            assert.strictEqual(true, checkNumberFilter(1, [10], '<='))
            assert.strictEqual(true, checkNumberFilter(10, [10], '<='))
        })
        it('should return false if values are not less than or equal', () => {
            assert.strictEqual(false, checkNumberFilter(10, [0], '<='))
            assert.strictEqual(false, checkNumberFilter(11, [10], '<='))
        })
    })

    // TODO update and uncomment these tests when we incorporate list audiences
    // describe('checkListAudienceFilters', () => {
    //     const data = [
    //         {
    //             _listAudience: 'test1',
    //             version: '1'
    //         }, {
    //             _listAudience: 'test1',
    //             version: '2'
    //         }, {
    //             _listAudience: 'test2',
    //             version: '1'
    //         }]
    //     it('should return true if user in listAudience for equality', () => {
    //         const comparator = '='
    //         const values = [{
    //             _listAudience: 'test1',
    //             version: '2'
    //         }]
    //
    //         assert.strictEqual(true, segmentation.checkListAudienceFilter({ data, values, comparator }))
    //     })
    //     it('should return false if user not in listAudience for equality', () => {
    //         const comparator = '='
    //         const values = [{
    //             _listAudience: 'test1',
    //             version: '3'
    //         }]
    //
    //         assert.strictEqual(false, segmentation.checkListAudienceFilter({ data, values, comparator }))
    //     })
    //
    //     it('should return true if user not in listAudience for inequality', () => {
    //         const comparator = '!='
    //         const values = [{
    //             _listAudience: 'test1',
    //             version: '3'
    //         }]
    //
    //         assert.strictEqual(true, segmentation.checkListAudienceFilter({ data, values, comparator }))
    //     })
    //
    //     it('should return false if user in listAudience for inequality', () => {
    //         const comparator = '!='
    //         const values = [{
    //             _listAudience: 'test1',
    //             version: '2'
    //         }]
    //
    //         assert.strictEqual(false, segmentation.checkListAudienceFilter({ data, values, comparator }))
    //     })
    //
    //     it('should throw error if filter not prepared for segmentation', () => {
    //         const comparator = '='
    //         const values = ['test1']
    //         try {
    //             segmentation.checkListAudienceFilter({ data, values, comparator })
    //         } catch (e) {
    //             assert.strictEqual(e.message, 'ListAudience filter must be an object, has not been prepared for segmentation')
    //             return
    //         }
    //         throw new Error()
    //     })
    // })

    describe('checkVersionFilters', () => {
        it('should return false if filter and version is null', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2', '1.1.3'] } as AudienceFilterOrOperator
            const filter1 = { type: 'user', comparator: '>=', values: ['1.1.2', '1.1.3'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkVersionFilters(null as unknown as string, filter))
            assert.strictEqual(false, checkVersionFilters(null as unknown as string, filter1))
        })
        it('should return true if filter equals version', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2', '1.1.3'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkVersionFilters('1.1.2', filter))
        })
        it('should return true if filter greater than or equals version', () => {
            const filter = { type: 'user', comparator: '>=', values: ['1.1.2', '1.1.3'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkVersionFilters('1.1.2', filter))
        })
        it('should return true if filter equals version non semver', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.2.12'] } as AudienceFilterOrOperator
            const filter2 = { type: 'user', comparator: '=', values: ['31.331.2222.12'] } as AudienceFilterOrOperator
            const filter3 = { type: 'user', comparator: '=', values: ['1.1.2.12.1.2.3'] } as AudienceFilterOrOperator
            assert.strictEqual(true, checkVersionFilters('1.1.2.12', filter))
            assert.strictEqual(true, checkVersionFilters('31.331.2222.12', filter2))
            assert.strictEqual(true, checkVersionFilters('1.1.2.12.1.2.3', filter3))
        })
        it('should return false if filter does not equals version', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.1'] } as AudienceFilterOrOperator
            assert.strictEqual(false, checkVersionFilters('1.1.2', filter))
        })
    })

    describe('checkVersionFilter', () => {
        it('should return true if string versions equal', () => {
            assert.strictEqual(true, checkVersionFilter('1', ['1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1', ['1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1.1', ['1.1.1'], '='))
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1'], '='))
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
            assert.strictEqual(true, checkVersionFilter('1.1.', ['1.1', '1.1'], '='))
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

    // describe('checkLanguage', () => {
    //     it('should return true if no string or filters', () => {
    //         assert.strictEqual(true, segmentation.checkLanguage())
    //         assert.strictEqual(true, segmentation.checkLanguage(null, null))
    //     })
    //     it('should return false if filter and no value', () => {
    //         let filter = { type: 'sessionCount', comparator: '=', values: ['en', 'fr'] }
    //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
    //     })
    //     it('should return false if exists filter and no value', () => {
    //         let filter = { type: 'sessionCount', comparator: 'exist' }
    //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
    //         assert.strictEqual(false, segmentation.checkLanguage('', filter))
    //     })
    //     it('should return true if exists filter and value', () => {
    //         let filter = { type: 'sessionCount', comparator: 'exist' }
    //         assert.strictEqual(true, segmentation.checkLanguage('en', filter))
    //     })
    //     it('should return false if not exists filter and value', () => {
    //         let filter = { type: 'sessionCount', comparator: '!exist' }
    //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
    //     })
    //     it('should return false if contains filter and no value', () => {
    //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
    //         assert.strictEqual(false, segmentation.checkLanguage(null, filter))
    //     })
    //     it('should return true if contains filter and value contains', () => {
    //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('en-CA', filter))
    //     })
    //     it('should return false if contains filter and value does not contain', () => {
    //         let filter = { type: 'sessionCount', comparator: 'contain', values: ['en'] }
    //         assert.strictEqual(false, segmentation.checkLanguage('fr', filter))
    //     })
    //     it('should return true if not contains filter and value', () => {
    //         let filter = { type: 'sessionCount', comparator: '!contain', values: ['en'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('fr', filter))
    //     })
    //     it('should return false if not contains filter and not value', () => {
    //         let filter = { type: 'sessionCount', comparator: '!contain', values: ['en'] }
    //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
    //     })
    //     it('should return true if no filter', () => {
    //         assert.strictEqual(true, segmentation.checkLanguage('en'))
    //         assert.strictEqual(true, segmentation.checkLanguage('en', null))
    //     })
    //     it('should return false if string is not a string', () => {
    //         assert.strictEqual(false, segmentation.checkLanguage(1, []))
    //     })
    //     it('should return false if filter value is not a string', () => {
    //         let filter = { type: 'sessionCount', comparator: '=', values: [1, 2] }
    //         assert.strictEqual(false, segmentation.checkLanguage('en', filter))
    //     })
    //     it('should return true if string is equal', () => {
    //         let filter = { type: 'sessionCount', comparator: '=', values: ['en'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('en', filter))
    //         assert.strictEqual(true, segmentation.checkLanguage('en-CA', filter))
    //     })
    //     it('should return false if string is not equal', () => {
    //         let filter = { type: 'sessionCount', comparator: '=', values: ['en'] }
    //         assert.strictEqual(false, segmentation.checkLanguage('fr', filter))
    //     })
    //     it('should return true if string is one of multiple values', () => {
    //         let filter = { type: 'platform', comparator: '=', values: ['en', 'fr'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('fr', filter))
    //         assert.strictEqual(true, segmentation.checkLanguage('fr-CA', filter))
    //     })
    //     it('should return true if string is equal to multiple filters', () => {
    //         let filters = [
    //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
    //             { type: 'last_app_lang', comparator: '!=', values: ['fr'] }
    //         ]
    //         assert.strictEqual(true, segmentation.checkLanguage('en', filters))
    //     })
    //     it('should return false for conflicting lang filters', () => {
    //         let filters = [
    //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
    //             { type: 'last_app_lang', comparator: '!=', values: ['en'] }
    //         ]
    //         assert.strictEqual(false, segmentation.checkLanguage('en', filters))
    //     })
    //     it('should return false for conflicting lang filters with iOS style lang', () => {
    //         let filters = [
    //             { type: 'last_app_lang', comparator: '=', values: ['en'] },
    //             { type: 'last_app_lang', comparator: '!=', values: ['en'] }
    //         ]
    //         assert.strictEqual(false, segmentation.checkLanguage('en-CA', filters))
    //     })
    //     it('should return false if string is not equal to multiple filters', () => {
    //         let filters = [
    //             { type: 'appLanguage', comparator: '=', values: ['en'] },
    //             { type: 'appLanguage', comparator: '=', values: ['fr'] }
    //         ]
    //         assert.strictEqual(false, segmentation.checkLanguage('en', filters))
    //     })
    //     it('should return true if satisfies value in filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant', filter))
    //     })
    //     it('should return true if satisfies value in filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant*'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant-HK', filter))
    //     })
    //     it('should return true if satisfies value in filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hant*'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hant-HK', filter))
    //     })
    //     it('should return true if satisfies value in the filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans*'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfasdf-hans-TW', filter))
    //     })
    //     it('should return true if satisfies one of the values in the filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*HK'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
    //     })
    //     it('should return true if satisfies value in filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*HK'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
    //     })
    //     it('should return true if satisifies one of the values in the filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans', 'zh*HK'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
    //     })
    //     it('should return true if does not satisfy one of the values in the filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '!=', values: ['zh*hans', 'zh*HK'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-asdfsd-HK', filter))
    //     })
    //     it('should return true if does not satisfy any of the values in the filter', () => {
    //         let filter = { type: 'last_app_lang', comparator: '!=', values: ['zh*hans', 'zh*HK'] }
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-hant', filter))
    //     })
    //     it('should return false if filter not satisfied', () => {
    //         let filter = { type: 'last_app_lang', comparator: '=', values: ['zh*hans'] }
    //         assert.strictEqual(false, segmentation.checkLanguage('zh-hant', filter))
    //     })
    //     it('should return false if not all filters are satisfied', () => {
    //         let filters = [
    //             { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] },
    //             { type: 'last_app_lang', comparator: '=', values: ['zh*hans'] }
    //         ]
    //         assert.strictEqual(false, segmentation.checkLanguage('zh-hant', filters))
    //     })
    //     it('should return true if all filters are satisfied', () => {
    //         let filters = [
    //             { type: 'last_app_lang', comparator: '=', values: ['zh*hant'] },
    //             { type: 'last_app_lang', comparator: '!=', values: ['zh*hans'] }
    //         ]
    //         assert.strictEqual(true, segmentation.checkLanguage('zh-hant', filters))
    //     })
    // })

    describe('checkCustomData', () => {
        const filterStr = {
            comparator: '=',
            dataKey: 'strKey',
            type: 'user',
            subType: 'customData',
            values: ['value']
        } as AudienceFilterOrOperator
        it('should return false if filter and no data', () => {
            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(false, checkCustomData(data, filterStr))
        })
        it('should return true if string value is equal', () => {
            assert.strictEqual(true, checkCustomData({ strKey: 'value' }, filterStr))
        })
        it('should return true if string is one OR value', () => {
            const filter = _.clone(filterStr)
            filter.values = ['value', 'value too']
            assert.strictEqual(true, checkCustomData({ strKey: 'value' }, filter))
        })
        it('should return false if string value is not equal', () => {
            assert.strictEqual(false, checkCustomData({ strKey: 'not value' }, filterStr))
        })

        it('should return false if string value isnt present', () => {
            assert.strictEqual(false, checkCustomData({}, filterStr))
        })

        const filterNum = _.clone(filterStr)
        filterNum.dataKey = 'numKey'
        filterNum.values = [0]
        it('should return true if number value is equal', () => {
            assert.strictEqual(true, checkCustomData({ numKey: 0 }, filterNum))
        })
        it('should return true if number is one OR value', () => {
            const filter = _.clone(filterNum)
            filter.values = [0, 1]
            assert.strictEqual(true, checkCustomData({ numKey: 1 }, filter))
        })
        it('should return false if number value is not equal', () => {
            assert.strictEqual(false, checkCustomData({ numKey: 1 }, filterNum))
        })

        const filterBool = _.clone(filterStr)
        filterBool.dataKey = 'boolKey'
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
                operator: 'AND'
            } as unknown as TopLevelOperator
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
                operator: 'AND'
            } as unknown as TopLevelOperator
            assert.strictEqual(false,
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter
                })
            )
        })

        it('should return true if one custom data key is missing with not equal filter value', () => {
            const filter = _.clone(filterNum)
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'AND'
            } as unknown as TopLevelOperator
            assert.strictEqual(true,
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter
                })
            )
        })

        it('should return true if no custom data is provided with not equal filter value', () => {
            const filter = _.clone(filterNum)
            filter.comparator = '!='
            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(true, checkCustomData(data, filter))
        })

        it('should return true if no custom data is provided with not exists filter value', () => {
            const filter = _.clone(filterNum)
            filter.comparator = '!exist'

            const data = null as unknown as Record<string, unknown>
            assert.strictEqual(true, checkCustomData(data, filter))
        })

        it('should return false if no custom data is provided with not equal filter and others', () => {
            const filter = _.clone(filterNum)
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'AND'
            } as unknown as TopLevelOperator
            assert.strictEqual(false,
                evaluateOperator({
                    data: { customData: null },
                    operator: operatorFilter
                })
            )
        })

        it('should return false if no custom data is provided with not exists filter and others', () => {
            const filter = _.clone(filterNum)
            filter.comparator = '!exist'
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'AND'
            } as unknown as TopLevelOperator
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
            values: ['FP']
        } as AudienceFilterOrOperator
        it('should return true if custom data contains value', () => {
            assert.strictEqual(true, checkCustomData({ last_order_no: 'FP2423423' }, containsFilter))
        })

        const existsFilter = {
            comparator: 'exist',
            type: 'user',
            subType: 'customData',
            dataKey: 'field',
            values: []
        } as AudienceFilterOrOperator
        it('should return true if custom data value exists', () => {
            assert.strictEqual(true, checkCustomData({ field: 'something' }, existsFilter))
        })

        it('should return false if custom data value does not exist', () => {
            assert.strictEqual(false, checkCustomData({ not_field: 'something' }, existsFilter))
        })
    })

    // describe('parseUserAgent', () => {
    //     describe('Desktop User Agents', () => {
    //         const outputChrome = { browser: 'Chrome', browserDeviceType: 'Desktop' }
    //         const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Desktop' }
    //         const outputSafari = { browser: 'Safari', browserDeviceType: 'Desktop' }
    //         const outputOther = { browser: 'Other', browserDeviceType: 'Desktop' }
    //
    //         it('should recognize a Chrome Desktop user agent', () => {
    //             const chromeDesktopUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) ' +
    //                 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36'
    //
    //             expect(parseUserAgent(chromeDesktopUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Firefox Desktop user agent', () => {
    //             const firefoxDesktopUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:77.0) ' +
    //                 'Gecko/20100101 Firefox/77.0'
    //
    //             expect(parseUserAgent(firefoxDesktopUA)).toEqual(outputFirefox)
    //         })
    //
    //         it('should recognize a Safari Desktop user agent', () => {
    //             const safariDesktopUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 ' +
    //                 '(KHTML, like Gecko) Version/13.1.2 Safari/605.1.15'
    //
    //             expect(parseUserAgent(safariDesktopUA)).toEqual(outputSafari)
    //         })
    //
    //         it('should recognize a Chromium Desktop user agent', () => {
    //             const chromiumDesktopUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) ' +
    //                 'Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30'
    //
    //             expect(parseUserAgent(chromiumDesktopUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Headless Chrome Desktop user agent', () => {
    //             const chromeHeadlessDesktopUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
    //                 '(KHTML, like Gecko) HeadlessChrome/63.0.3205.0 Safari/537.36'
    //
    //             expect(parseUserAgent(chromeHeadlessDesktopUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should default the user agent as Other Desktop', () => {
    //             const postmanUA = 'PostmanRuntime/7.26.1'
    //
    //             expect(parseUserAgent(postmanUA)).toEqual(outputOther)
    //         })
    //     })
    //
    //     describe('Mobile User Agents (iOS)', () => {
    //         const outputChrome = { browser: 'Chrome', browserDeviceType: 'Mobile' }
    //         const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Mobile' }
    //         const outputSafari = { browser: 'Safari', browserDeviceType: 'Mobile' }
    //
    //         it('should recognize a Chrome Mobile user agent', () => {
    //             const chromeMobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 ' +
    //                 '(KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
    //
    //             expect(parseUserAgent(chromeMobileUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Firefox Mobile user agent', () => {
    //             const firefoxMobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) ' +
    //                 'AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/11.0b9935 Mobile/15E216 Safari/605.1.15'
    //
    //             expect(parseUserAgent(firefoxMobileUA)).toEqual(outputFirefox)
    //         })
    //
    //         it('should recognize a Safari Mobile user agent', () => {
    //             const safariMobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X)' +
    //                 ' AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
    //
    //             expect(parseUserAgent(safariMobileUA)).toEqual(outputSafari)
    //         })
    //     })
    //
    //     describe('Mobile User Agents (Android)', () => {
    //         const outputChrome = { browser: 'Chrome', browserDeviceType: 'Mobile' }
    //         const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Mobile' }
    //
    //         it('should recognize a Chrome Mobile user agent', () => {
    //             const chromeMobileUA = 'Mozilla/5.0 (Linux; Android 10; SM-G975W) ' +
    //                 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.111 Mobile Safari/537.36'
    //
    //             expect(parseUserAgent(chromeMobileUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Firefox Mobile user agent', () => {
    //             const firefoxMobileUA = 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'
    //
    //             expect(parseUserAgent(firefoxMobileUA)).toEqual(outputFirefox)
    //         })
    //     })
    //
    //     describe('Tablet User Agents (iOS)', () => {
    //         const outputChrome = { browser: 'Chrome', browserDeviceType: 'Tablet' }
    //         const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Tablet' }
    //         const outputSafari = { browser: 'Safari', browserDeviceType: 'Tablet' }
    //
    //         it('should recognize a Chrome Tablet user agent', () => {
    //             const chromeTabletUA = 'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) ' +
    //                 'AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/71.0.3578.77 Mobile/15E148 Safari/605.1'
    //
    //             expect(parseUserAgent(chromeTabletUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Firefox Tablet user agent', () => {
    //             const firefoxTabletUA = 'Mozilla/5.0 (iPad; CPU OS 10_2_1 like Mac OS X) ' +
    //                 'AppleWebKit/602.4.6 (KHTML, like Gecko) FxiOS/6.0 Mobile/14D27 Safari/602.4.6'
    //
    //             expect(parseUserAgent(firefoxTabletUA)).toEqual(outputFirefox)
    //         })
    //
    //         it('should recognize a Safari Tablet user agent', () => {
    //             const safariTabletUA = 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) ' +
    //                 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
    //
    //             expect(parseUserAgent(safariTabletUA)).toEqual(outputSafari)
    //         })
    //     })
    //
    //     describe('Tablet User Agents (Android)', () => {
    //         const outputChrome = { browser: 'Chrome', browserDeviceType: 'Tablet' }
    //         const outputFirefox = { browser: 'Firefox', browserDeviceType: 'Tablet' }
    //
    //         it('should recognize a Chrome Tablet user agent', () => {
    //             const chromeTabletUA = 'Mozilla/5.0 (Linux; Android 7.0; Pixel C Build/NRD90M; wv)' +
    //                 ' AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36'
    //
    //             expect(parseUserAgent(chromeTabletUA)).toEqual(outputChrome)
    //         })
    //
    //         it('should recognize a Firefox Tablet user agent', () => {
    //             const firefoxTabletUA = 'Mozilla/5.0 (Android 8.1.0; Tablet; rv:68.0) Gecko/68.0 Firefox/68.0'
    //
    //             expect(parseUserAgent(firefoxTabletUA)).toEqual(outputFirefox)
    //         })
    //     })
    // })
    //
    // describe('parseUserAgent - Handle invalid input', () => {
    //     it('should return undefined properties when the user agent is undefined', () => {
    //         expect(parseUserAgent(undefined)).toEqual({
    //             browser: undefined,
    //             browserDeviceType: undefined
    //         })
    //     })
    //
    //     it('should return undefined properties when the user agent is empty', () => {
    //         expect(parseUserAgent('')).toEqual({
    //             browser: undefined,
    //             browserDeviceType: undefined
    //         })
    //     })
    //
    //     it('should return an Other Desktop segmentation when the user agent is unknown', () => {
    //         expect(parseUserAgent('not a real user agent')).toEqual({
    //             browser: 'Other',
    //             browserDeviceType: 'Desktop'
    //         })
    //     })
    // })

    describe('filterAudiencesFromSubtypes', () => {
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
                    'operator': 'AND'
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
                    'operator': 'AND'
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
                    'operator': 'AND'
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
                    'operator': 'AND'
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
                    'operator': 'AND'
                }
            }] as unknown as Audience[]
        it('should filter all Android TV audiences properly if it is included in data', () => {
            const data = {
                platform: 'Android TV'
            }
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
                platform: 'iOS'
            }
            const filteredAudiences = audiences.filter((aud) => {
                return evaluateOperator({ operator: aud.filters, data })
            })
            expect(filteredAudiences.length).toEqual(1)
            expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b913')
        })
    })
})
