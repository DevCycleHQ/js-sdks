import * as assert from 'assert'
import {
    evaluateOperatorFromJSON,
    setPlatformData,
} from '../bucketingImportHelper'
const defaultPlatformData = {
    platform: '',
    platformVersion: '',
    sdkType: '',
    sdkVersion: '',
    sdkPlatform: '',
    deviceModel: '',
}

const setPlatformDataJSON = (data: unknown) => {
    setPlatformData(JSON.stringify(data))
}

type SegmentationResult = {
    result: boolean
    reasonDetails?: string
}

const evaluateOperator = ({
    operator,
    data,
    audiences = {},
}: {
    operator: unknown
    data: Record<string, unknown>
    audiences?: Record<string, unknown>
}): SegmentationResult => {
    // set required field to make class constructors happy
    data.user_id ||= 'some_user'
    const evalResult = evaluateOperatorFromJSON(
        JSON.stringify(operator),
        JSON.stringify(data),
        JSON.stringify(audiences),
    )
    return JSON.parse(evalResult) as SegmentationResult
}

const checkStringsFilter = (
    string: unknown,
    filter: { values?: unknown[]; comparator: string },
) => {
    const emailFilter = {
        type: 'user',
        subType: 'email',
        values: [],
        ...filter,
    }

    const operator = {
        filters: [emailFilter],
        operator: 'and',
    }

    const data = { email: string, user_id: 'some_user' }

    return evaluateOperator({ operator, data })
}
const checkBooleanFilter = (
    bool: unknown,
    filter: { values?: unknown[]; comparator: string },
) => {
    const customDataFilter = {
        dataKey: 'key',
        type: 'user',
        subType: 'customData',
        dataKeyType: 'Boolean',
        values: [],
        ...filter,
    }

    const operator = {
        filters: [customDataFilter],
        operator: 'and',
    }

    const data = { customData: { key: bool }, user_id: 'some_user' }

    return evaluateOperator({ operator, data })
}

const checkNumbersFilter = (
    number: unknown,
    filter: { values?: unknown[]; comparator: string },
): SegmentationResult => {
    const customDataFilter = {
        dataKey: 'key',
        type: 'user',
        subType: 'customData',
        dataKeyType: 'Number',
        values: [],
        ...filter,
    }

    const operator = {
        filters: [customDataFilter],
        operator: 'and',
    }

    const data = { customData: { key: number }, user_id: 'some_user' }
    return evaluateOperator({ operator, data })
}
const checkVersionFilters = (
    appVersion: string,
    filter: { values?: unknown[]; comparator: string },
): SegmentationResult => {
    const appVersionFilter = {
        type: 'user',
        subType: 'appVersion',
        values: [],
        ...filter,
    }

    const operator = {
        filters: [appVersionFilter],
        operator: 'and',
    }

    const data = { appVersion: appVersion, user_id: 'some_user' }
    return evaluateOperator({ operator, data })
}

const checkVersionFilter = (
    appVersion: string,
    values: string[],
    comparator: string,
): SegmentationResult => {
    return checkVersionFilters(appVersion, { values, comparator })
}

const checkCustomData = (
    data: Record<string, unknown> | null,
    filter: unknown,
): SegmentationResult => {
    const operator = {
        filters: [filter],
        operator: 'and',
    }

    const user = { customData: data, user_id: 'some_user' }
    return evaluateOperator({ operator, data: user })
}

describe('SegmentationManager Unit Test', () => {
    beforeEach(() => {
        setPlatformDataJSON(defaultPlatformData)
    })
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
    //             expect(e.message)
    //              .toBe('ListAudience filter must be an object, has not been prepared for segmentation')
    //             return
    //         }
    //
    //         throw new Error()
    //     })
    // })

    describe('evaluateOperator', () => {
        it('should fail for empty filters', () => {
            const filters: Record<string, unknown>[] = []

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data, operator }),
            )
            const orOp = {
                filters,
                operator: 'or',
            }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data: {}, operator: orOp }),
            )
        })

        it('should pass for all filter', () => {
            const filters = [
                {
                    type: 'all',
                    comparator: '=',
                    values: [],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'All Users' },
                evaluateOperator({ data, operator }),
            )
        })

        describe('evaluateOperator should handle optIn filter', () => {
            const filters = [
                {
                    type: 'optIn',
                    comparator: '=',
                    values: [],
                },
            ]

            const optInOperator = {
                filters,
                operator: 'and',
            }

            const optInData = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            it('should fail optIn filter when feature in optIns and isOptInEnabled ', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({
                        data: optInData,
                        operator: optInOperator,
                    }),
                )
            })
        })

        describe('evaluateOperator should handle a new filter (myNewFilter) type', () => {
            const filters = [
                {
                    type: 'myNewFilter',
                    comparator: '=',
                    values: [],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            it('should fail myNewFilter filter', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({ data, operator }),
                )
            })
        })

        describe('evaluateOperator should handle a new operator (xylophone) type', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['brooks@big.lunch'],
                },
            ]

            const operator = {
                filters,
                operator: 'xylophone',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            it('should fail xylophone operator', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({ data, operator }),
                )
            })
        })

        describe('evaluateOperator should handle audienceMatch filter', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['dexter@smells.nice', 'brooks@big.lunch'],
                },
                {
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '>',
                    values: ['1.0.0'],
                },
            ]
            const operator = {
                filters,
                operator: 'and',
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS',
            }
            const audienceMatchOperator = {
                filters: [
                    {
                        type: 'audienceMatch',
                        comparator: '=',
                        _audiences: ['test'],
                    },
                ],
                operator: 'and',
            }

            const audienceMatchOperatorNotEqual = {
                filters: [
                    {
                        type: 'audienceMatch',
                        comparator: '!=',
                        _audiences: ['test'],
                    },
                ],
                operator: 'and',
            }
            it('should pass seg for an AND operator', () => {
                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                }
                assert.deepStrictEqual(
                    {
                        result: true,
                        reasonDetails:
                            'Audience Match -> Country AND Email AND App Version',
                    },
                    evaluateOperator({
                        data,
                        operator: audienceMatchOperator,
                        audiences,
                    }),
                )
            })

            it('should pass seg for a nested audiencematch filter', () => {
                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                }
                const parentOperator = {
                    operator: 'and',
                    filters: [audienceMatchOperator, operator],
                }
                assert.deepStrictEqual(
                    {
                        result: true,
                        reasonDetails:
                            'Audience Match -> Country AND Email AND App Version',
                    },
                    evaluateOperator({
                        data,
                        operator: parentOperator,
                        audiences,
                    }),
                )
            })

            it('should not pass seg when referenced audience does not exist', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({
                        data,
                        operator: audienceMatchOperator,
                        audiences: {},
                    }),
                )
            })

            it('should not pass seg when not in audience for an AND operator', () => {
                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                }

                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({
                        data,
                        operator: audienceMatchOperatorNotEqual,
                        audiences,
                    }),
                )
            })
            it('should pass seg for nested audiences', () => {
                const nestedAudienceMatchOperator = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '=',
                            _audiences: ['nested'],
                        },
                    ],
                    operator: 'and',
                }

                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                    nested: {
                        _id: 'nested',
                        filters: audienceMatchOperator,
                    },
                }
                assert.deepStrictEqual(
                    {
                        result: true,
                        reasonDetails:
                            'Audience Match -> Audience Match -> Country AND Email AND App Version',
                    },
                    evaluateOperator({
                        data,
                        operator: nestedAudienceMatchOperator,
                        audiences,
                    }),
                )
            })
            it('should not pass seg for nested audiences with !=', () => {
                const nestedAudienceMatchOperator = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '!=',
                            _audiences: ['nested'],
                        },
                    ],
                    operator: 'and',
                }

                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                    nested: {
                        _id: 'nested',
                        filters: audienceMatchOperator,
                    },
                }
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({
                        data,
                        operator: nestedAudienceMatchOperator,
                        audiences,
                    }),
                )
            })
            it('should pass seg for an AND operator with multiple values', () => {
                const filters = [
                    {
                        type: 'user',
                        subType: 'country',
                        comparator: '=',
                        values: ['USA'],
                    },
                ]

                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                    test2: {
                        _id: 'test2',
                        filters: {
                            filters,
                            operator: 'and',
                        },
                    },
                }
                const audienceMatchOperatorMultiple = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '=',
                            _audiences: ['test', 'test2'],
                        },
                    ],
                    operator: 'and',
                }
                assert.deepStrictEqual(
                    {
                        result: true,
                        reasonDetails:
                            'Audience Match -> Country AND Email AND App Version',
                    },
                    evaluateOperator({
                        data,
                        operator: audienceMatchOperatorMultiple,
                        audiences,
                    }),
                )
            })
            it('should not pass seg for an AND operator with multiple values', () => {
                const filters = [
                    {
                        type: 'user',
                        subType: 'country',
                        comparator: '=',
                        values: ['USA'],
                    },
                ]

                const audiences = {
                    test: {
                        _id: 'test',
                        filters: operator,
                    },
                    test2: {
                        _id: 'test2',
                        filters: {
                            filters,
                            operator: 'and',
                        },
                    },
                }
                const audienceMatchOperatorMultiple = {
                    filters: [
                        {
                            type: 'audienceMatch',
                            comparator: '!=',
                            _audiences: ['test', 'test2'],
                        },
                    ],
                    operator: 'and',
                }
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({
                        data,
                        operator: audienceMatchOperatorMultiple,
                        audiences,
                    }),
                )
            })
        })

        describe('evaluateOperator should handle a new user sub-filter (myNewFilter) type', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'myNewFilter',
                    comparator: '=',
                    values: [],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }
            it('should fail for user filter with subType of myNewFilter', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({ data, operator }),
                )
            })
        })

        describe('evaluateOperator should handle a new comparator type', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'email',
                    comparator: 'wowNewComparator',
                    values: [],
                },
                {
                    type: 'audienceMatch',
                    _audiences: [],
                    comparator: 'wowNewComparator',
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                platform: 'iOS',
            }

            it('should fail for user and audienceMatch filters with comparator of myNewFilter', () => {
                assert.deepStrictEqual(
                    { result: false },
                    evaluateOperator({ data, operator }),
                )
            })
        })

        it('should work for an AND operator', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['dexter@smells.nice', 'brooks@big.lunch'],
                },
                {
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '>',
                    values: ['1.0.0'],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                {
                    result: true,
                    reasonDetails: 'Country AND Email AND App Version',
                },
                evaluateOperator({ data, operator }),
            )
        })

        it('should work for a top level AND with nested AND operator', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['dexter@smells.nice', 'brooks@big.lunch'],
                },
                {
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '>',
                    values: ['1.0.0'],
                },
            ]

            const topLevelFilter = {
                type: 'user',
                subType: 'country',
                comparator: '!=',
                values: ['Nanada'],
            }
            const nestedOperator = {
                filters,
                operator: 'and',
            }

            const operator = {
                filters: [topLevelFilter, nestedOperator],
                operator: 'and',
            }
            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                {
                    result: true,
                    reasonDetails: 'Country AND Email AND App Version',
                },
                evaluateOperator({ data, operator }),
            )
        })

        it('should work for an OR operator', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['dexter@smells.nice', 'brooks@big.lunch'],
                },
                {
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '>',
                    values: ['1.0.0'],
                },
            ]

            const operator = {
                filters,
                operator: 'or',
            }

            const data = {
                country: 'whomp',
                email: 'fake@email.com',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should work for a nested OR operator', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'email',
                    comparator: '=',
                    values: ['dexter@smells.nice', 'brooks@big.lunch'],
                },
                {
                    type: 'user',
                    subType: 'appVersion',
                    comparator: '>',
                    values: ['1.0.0'],
                },
            ]

            const nestedOperator = {
                filters,
                operator: 'or',
            }

            const operator = {
                filters: [
                    nestedOperator,
                    {
                        type: 'user',
                        subType: 'country',
                        comparator: '=',
                        values: ['Nanada'],
                    },
                ],
                operator: 'or',
            }
            const data = {
                country: 'whomp',
                email: 'fake@email.com',
                platformVersion: '2.0.0',
                appVersion: '2.0.2',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should work for an AND operator containing a custom data filter', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'customData',
                    dataKey: 'something',
                    comparator: '!=',
                    values: ['Canada'],
                    dataKeyType: 'String',
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            }

            const data = {
                country: 'Canada',
                email: 'brooks@big.lunch',
                appVersion: '2.0.0',
                platform: 'iOS',
            }
            assert.deepStrictEqual(
                {
                    result: true,
                    reasonDetails: 'Country AND Custom Data -> something',
                },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for customData filter != multiple values', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'customData',
                        dataKey: 'testKey',
                        dataKeyType: 'String',
                        comparator: '!=',
                        values: ['dataValue', 'dataValue2'],
                    },
                ],
                operator: 'and',
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for private customData filter != multiple values', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'customData',
                        dataKey: 'testKey',
                        dataKeyType: 'String',
                        comparator: '!=',
                        values: ['dataValue', 'dataValue2'],
                    },
                ],
                operator: 'and',
            }

            const data = { privateCustomData: { testKey: 'dataValue' } }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for customData filter does not contain multiple values', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'customData',
                        dataKey: 'testKey',
                        dataKeyType: 'String',
                        comparator: '!contain',
                        values: ['dataValue', 'otherValue'],
                    },
                ],
                operator: 'and',
            }

            const data = { customData: { testKey: 'otherValue' } }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for user_id filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'user_id',
                        comparator: '=',
                        values: ['test_user'],
                    },
                ],
                operator: 'and',
            }

            const data = { user_id: 'test_user' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'User ID' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for email filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'email',
                        comparator: '=',
                        values: ['test@devcycle.com'],
                    },
                ],
                operator: 'and',
            }

            const data = { email: 'test@devcycle.com' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for country filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'country',
                        comparator: '=',
                        values: ['CA'],
                    },
                ],
                operator: 'and',
            }

            const data = { country: 'CA' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Country' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for appVersion filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'appVersion',
                        comparator: '=',
                        values: ['1.0.1'],
                    },
                ],
                operator: 'and',
            }

            const data = { appVersion: '1.0.1' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for platformVersion filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'platformVersion',
                        comparator: '>=',
                        values: ['15.1'],
                    },
                ],
                operator: 'and',
            }

            const data = {}
            setPlatformDataJSON({
                ...defaultPlatformData,
                platformVersion: '15.1',
            })
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Platform Version' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for platform filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'platform',
                        comparator: '=',
                        values: ['iOS', 'iPadOS', 'tvOS'],
                    },
                ],
                operator: 'and',
            }

            const data = {}
            setPlatformDataJSON({ ...defaultPlatformData, platform: 'iOS' })
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Platform' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for deviceModel filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'deviceModel',
                        comparator: '=',
                        values: ['Samsung Galaxy F12'],
                    },
                ],
                operator: 'and',
            }

            const data = { deviceModel: 'Samsung Galaxy F12' }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Device Model' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for customData filter', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'customData',
                        dataKey: 'testKey',
                        dataKeyType: 'String',
                        comparator: '=',
                        values: ['dataValue'],
                    },
                ],
                operator: 'and',
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> testKey' },
                evaluateOperator({ data, operator }),
            )
        })

        it('should pass for customData filter != multiple values', () => {
            const operator = {
                filters: [
                    {
                        type: 'user',
                        subType: 'customData',
                        dataKey: 'testKey',
                        dataKeyType: 'String',
                        comparator: '!=',
                        values: ['dataValue', 'dataValue2'],
                    },
                ],
                operator: 'and',
            }

            const data = { customData: { testKey: 'dataValue' } }
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data, operator }),
            )
        })
    })

    describe('checkStringsFilter', () => {
        it('should return false if filter and no valid value', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter(null, filter),
            )
        })
        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter(null, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('', filter),
            )
        })
        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('string', filter),
            )
        })
        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter(null, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('', filter),
            )
        })
        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('string', filter),
            )
        })
        it('should return false if contains filter and no value', () => {
            const filter = {
                type: 'user',
                comparator: 'contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter(null, filter),
            )
        })
        it('should return true if startWith filter and contains', () => {
            const filter = {
                type: 'user',
                comparator: 'startWith',
                values: ['test@'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if ends filter and contains', () => {
            const filter = {
                type: 'user',
                comparator: 'endWith',
                values: ['@devcycle.com'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if not startWith filter and does not contain', () => {
            const filter = {
                type: 'user',
                comparator: '!startWith',
                values: ['testuser@'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if ends with filter and contains', () => {
            const filter = {
                type: 'user',
                comparator: '!endWith',
                values: ['@devcycle.io'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if startWith filter and contains', () => {
            const filter = {
                type: 'user',
                comparator: '!startWith',
                values: ['test@'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if ends with filter and contains', () => {
            const filter = {
                type: 'user',
                comparator: '!endWith',
                values: ['@devcycle.com'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return false if starts with with filter with empty value', () => {
            const filter = {
                type: 'user',
                comparator: 'startWith',
                values: [''],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return false if ends with filter with empty value', () => {
            const filter = {
                type: 'user',
                comparator: 'endWith',
                values: [''],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return false if contains filter with empty value', () => {
            const filter = {
                type: 'user',
                comparator: 'contains',
                values: [''],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('test@devcycle.com', filter),
            )
        })
        it('should return true if browser filter works', () => {
            const filter = { type: 'user', comparator: '=', values: ['Chrome'] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('Chrome', filter),
            )
        })
        it('should return true if string filter works with non string value in values', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['Chrome', 0],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('Chrome', filter),
            )
        })
        it('should return true if browser device type filter works', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['Desktop'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('Desktop', filter),
            )
        })
        it('should return true if contains filter and value contains', () => {
            const filter = {
                type: 'user',
                comparator: 'contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('helloWorld', filter),
            )
        })
        it('should return false if contains filter and value does not contain', () => {
            const filter = {
                type: 'user',
                comparator: 'contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('xy', filter),
            )
        })
        it('should return true if not contains filter and no value', () => {
            const filter = {
                type: 'user',
                comparator: '!contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter(null, filter),
            )
        })
        it('should return true if not contains filter and value', () => {
            const filter = {
                type: 'user',
                comparator: '!contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('xy', filter),
            )
        })
        it('should return false if not contains filter and not value', () => {
            const filter = {
                type: 'user',
                comparator: '!contain',
                values: ['hello'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('hello', filter),
            )
        })

        it('should return false if string is not a string', () => {
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter(1, { comparator: '=' }),
            )
        })
        it('should return false if filter value is not a string', () => {
            const filter = { type: 'user', comparator: '=', values: [1, 2] }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('Male', filter),
            )
        })
        it('should return true if string is equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('Male', filter),
            )
        })
        it('should return false if string is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: ['Male'] }
            assert.deepStrictEqual(
                { result: false },
                checkStringsFilter('Female', filter),
            )
        })
        it('should return true if string is one of multiple values', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['iPhone OS', 'Android'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('iPhone OS', filter),
            )
        })
        it('should return true if string is not one of multiple values', () => {
            const filter = {
                type: 'user',
                comparator: '!=',
                values: ['iPhone OS', 'Android', 'Android TV', 'web'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Email' },
                checkStringsFilter('Roku', filter),
            )
        })
        it('should return true if string is equal to multiple filters', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '!=',
                    values: ['Not Canada'],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            } as unknown

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Country AND Country' },
                evaluateOperator({ data: { country: 'Canada' }, operator }),
            )
        })

        it('should return false if string is not equal to multiple filters', () => {
            const filters = [
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Canada'],
                },
                {
                    type: 'user',
                    subType: 'country',
                    comparator: '=',
                    values: ['Not Canada'],
                },
            ]

            const operator = {
                filters,
                operator: 'and',
            } as unknown

            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({ data: { country: 'Canada' }, operator }),
            )
        })
    })

    describe('checkBooleanFilter', () => {
        it('should return false if exists filter and no value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(null, filter),
            )
        })
        it('should return true if exists filter and value', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(true, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(false, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(10, filter),
            )
        })
        it('should return true if not exists filter and no value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(null, filter),
            )
        })
        it('should return false if not exists filter and value', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(true, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(false, filter),
            )
        })
        it('should return false if filters value is not a boolean', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['hi1', 'hi2'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(true, filter),
            )
        })
        it('should return true if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(true, filter),
            )
        })
        it('should return true if filters values contains boolean value and non boolean value', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: [true, 'test'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(true, filter),
            )
        })
        it('should return false if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '=', values: [true] }
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(false, filter),
            )
        })
        it('should return false if filers value equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] }
            assert.deepStrictEqual(
                { result: false },
                checkBooleanFilter(true, filter),
            )
        })
        it('should return true if filers value does not equals boolean', () => {
            const filter = { type: 'user', comparator: '!=', values: [true] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkBooleanFilter(false, filter),
            )
        })
    })

    describe('checkNumbersFilter', () => {
        it('should return false if exists filter and no number', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(null as unknown as number, filter),
            )
        })

        it('should return true if exists filter and number', () => {
            const filter = { type: 'user', comparator: 'exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return true if not exists filter and no number', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(null as unknown as number, filter),
            )
        })

        it('should return false if not exists filter and number', () => {
            const filter = { type: 'user', comparator: '!exist' }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return false if filter value is not a number', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['hi1', 'hi2'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(12, filter),
            )
        })

        it('should return true if values does not equal filter values', () => {
            const filter = { type: 'user', comparator: '!=', values: [10, 11] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(12, filter),
            )
        })

        it('should return true if number is equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return true if number is in values array with non-number values', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: [10, 'test'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return false if number is not equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(11, filter),
            )
        })

        it('should return false if number is equal to a OR values', () => {
            const filter = { type: 'user', comparator: '=', values: [10, 11] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(11, filter),
            )
        })

        it('should return true if values are equal', () => {
            const filter = { type: 'user', comparator: '=', values: [0] }
            const filter2 = { type: 'user', comparator: '=', values: [10] }
            const filter3 = { type: 'user', comparator: '=', values: [0, 10] }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter2),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter3),
            )
        })

        it('should return false if values are not equal', () => {
            const filter = { type: 'user', comparator: '=', values: [10] }
            const filter2 = {
                type: 'user',
                comparator: '=',
                values: [-10, -12],
            }

            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return true if values are not equal', () => {
            const filter = { type: 'user', comparator: '!=', values: [10] }
            const filter2 = {
                type: 'user',
                comparator: '!=',
                values: [-10, -12],
            }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return true if values are not equal', () => {
            const filter = { type: 'user', comparator: '!=', values: [10] }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter),
            )
        })

        it('should return true if values are greater than', () => {
            const filter = { type: 'user', comparator: '>', values: [-1] }
            const filter2 = { type: 'user', comparator: '>', values: [1, 5] }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return false if values are not greater than', () => {
            const filter = { type: 'user', comparator: '>', values: [10] }
            const filter2 = { type: 'user', comparator: '>', values: [10] }
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return true if values are greater than or equal', () => {
            const filter = { type: 'user', comparator: '>=', values: [-1] }
            const filter2 = { type: 'user', comparator: '>=', values: [1] }
            const filter3 = { type: 'user', comparator: '>=', values: [10] }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter2),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter3),
            )
        })

        it('should return false if values are not greater than or equal', () => {
            const filter = { type: 'user', comparator: '>=', values: [10] }
            const filter2 = { type: 'user', comparator: '>=', values: [11] }

            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(0, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return true if values are less than', () => {
            const filter = { type: 'user', comparator: '<', values: [0] }
            const filter2 = { type: 'user', comparator: '<', values: [10] }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(-1, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(1, filter2),
            )
        })

        it('should return false if values are not less than', () => {
            const filter = { type: 'user', comparator: '<', values: [0] }
            const filter2 = { type: 'user', comparator: '<', values: [10] }

            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter2),
            )
        })

        it('should return true if values are less than or equal', () => {
            const filter = { type: 'user', comparator: '<=', values: [0] }
            const filter2 = { type: 'user', comparator: '<=', values: [10] }
            const filter3 = { type: 'user', comparator: '<=', values: [10] }

            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(-1, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(1, filter2),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> key' },
                checkNumbersFilter(10, filter3),
            )
        })

        it('should return false if values are not less than or equal', () => {
            const filter = { type: 'user', comparator: '<=', values: [0] }
            const filter2 = { type: 'user', comparator: '<=', values: [10] }

            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(10, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkNumbersFilter(11, filter2),
            )
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
    //             assert.strictEqual(e.message,
    //              'ListAudience filter must be an object, has not been prepared for segmentation')
    //             return
    //         }
    //         throw new Error()
    //     })
    // })

    describe('checkVersionFilters', () => {
        it('should return false if filter and version is null', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['1.1.2', '1.1.3'],
            }
            const filter1 = {
                type: 'user',
                comparator: '>=',
                values: ['1.1.2', '1.1.3'],
            }
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilters(null as unknown as string, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilters(null as unknown as string, filter1),
            )
        })
        it('should return true if filter equals version', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['1.1.2', '1.1.3'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilters('1.1.2', filter),
            )
        })
        it('should return true if filter greater than or equals version', () => {
            const filter = {
                type: 'user',
                comparator: '>=',
                values: ['1.1.2', '1.1.3'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilters('1.1.2', filter),
            )
        })
        it('should return true if filter equals version non semver', () => {
            const filter = {
                type: 'user',
                comparator: '=',
                values: ['1.1.2.12'],
            }
            const filter2 = {
                type: 'user',
                comparator: '=',
                values: ['31.331.2222.12'],
            }
            const filter3 = {
                type: 'user',
                comparator: '=',
                values: ['1.1.2.12.1.2.3'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilters('1.1.2.12', filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilters('31.331.2222.12', filter2),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilters('1.1.2.12.1.2.3', filter3),
            )
        })
        it('should return false if filter does not equals version', () => {
            const filter = { type: 'user', comparator: '=', values: ['1.1.1'] }
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilters('1.1.2', filter),
            )
        })
    })

    describe('checkVersionFilter', () => {
        it('should return true if string versions equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1.1'], '='),
            )
        })
        it('should return false if string versions not equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1.'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.2.3'], '='),
            )
        })
        it('should return false if string versions not equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['1'], '!='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1'], '!='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1.1'], '!='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1'], '!='),
            )
        })
        it('should return true if string versions not equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['2'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.2'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1.1'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1.'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.2.3'], '!='),
            )
        })
        it('should return true if string versions greater than', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.2.3'], '>'),
            )
        })
        it('should return true if string versions greater than', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2', ['1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2', ['1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2.1', ['1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['1.2'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.', ['1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['1.1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['1.2'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['1.2.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241', ['4.8'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.2'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>'),
            )
        })
        it('should return true if string versions greater than or equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['2'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.2.3'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241', ['4.9'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['5'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.9'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8.242'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8.241.5'], '>='),
            )
        })
        it('should return true if string versions greater than or equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2', ['1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2.1', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['1.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['1.1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['1.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['1.2.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.241.0'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.241.2'], '>='),
            )
        })
        it('should work if version has other characters', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['v1.2.1-2v3asda'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.2', ['v1.2.1-va1sda'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['v1.2.1-vasd32a'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['v1.2.1-vasda'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('v1.2.1-va21sda', ['v1.2.1-va13sda'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.0', ['v1.2.1-vas1da'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['v1.2.1- va34sda'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.0', ['v1.2.1-vas3da'], '<='),
            )
        })
        it('should return false if string versions less than', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['2'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.2'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.2.3'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['5'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.9'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.242'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.241.5'], '<'),
            )
        })
        it('should return false if string versions less than', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('2', ['1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2', ['1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('2.1', ['1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['1.2'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.', ['1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['1.1.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2.'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2.1'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8.241'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8.241.0'], '<'),
            )
        })
        it('should return false if string versions less than or equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['2'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.2'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.2.3'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('4.8.241.2', ['4.8.241.2'], '<='),
            )
        })
        it('should return false if string versions less than or equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('2', ['1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2', ['1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('2.1', ['1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['1.2'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.', ['1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['1.1.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2.'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.2', ['1.2.1'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('4.8.241.2', ['4.8.241'], '<='),
            )
        })
        it('should return true if any numbers equal array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1', '1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1', '1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1', ''], '='),
            )
        })
        it('should return false if all numbers not equal array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2', '1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2', '1'], '='),
            )
        })
        it('should return true if any string versions equal array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1', '1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1', '1'], '='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.1.1', '1.1'], '='),
            )
        })
        it('should return false if all string versions not equal array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter(null as unknown as string, ['2', '3'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2', '3'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2', '1.2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.1', '1.2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1.1', '1.2'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.1', '1.1'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1', '1.1.'], '='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.1', ['1.2.3', '1.'], '='),
            )
        })
        it('should return false if multiple versions do not equal the version', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2', '1'], '!='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2', '1.1'], '!='),
            )
        })
        it('should return true if multiple versions do not equal version', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1.1', '1.2'], '!='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1', '1'], '!='),
            )
        })
        it('should return false if any string versions not greater than array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['1', '1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1', '1.1.', '1.1'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2'], '>'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.0'], '>'),
            )
        })
        it('should return true any if string versions greater than array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2', ['1', '2.0'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.1', ['1.2', '1.2'], '>'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.2.', ['1.1', '1.9.'], '>'),
            )
        })
        it('should return false if all string versions not greater than or equal array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['2', '1.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.2'], '>='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1', ['1.1.1', '1.2'], '>='),
            )
        })
        it('should return true if any string versions greater than or equal array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1', '1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1', '1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.1', ['1.2', '1.1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1'], '>='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('2', ['1', '3'], '>='),
            )
        })
        it('should return true if any string versions less than array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['2', '1'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.2', '1.5'], '<'),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1'], '<'),
            )
        })
        it('should return false if all string versions less than array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1', ['1', '1.0'], '<'),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.1.', ['1.1', '1.1.0'], '<'),
            )
        })
        it('should return true if any string versions less than or equal array', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1', ['1', '5'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1', ['1.1', '1.1.'], '<='),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'App Version' },
                checkVersionFilter('1.1.', ['1.1.1', '1.1.'], '<='),
            )
        })
        it('should return false if all string versions not less than or equal array', () => {
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('2', ['1', '1.9'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.1', ['1.2', '1.2'], '<='),
            )
            assert.deepStrictEqual(
                { result: false },
                checkVersionFilter('1.2.', ['1.1', '1.1.9'], '<='),
            )
        })
    })

    describe('checkCustomData', () => {
        const filterStr = {
            comparator: '=',
            dataKey: 'strKey',
            type: 'user',
            subType: 'customData',
            dataKeyType: 'String',
            values: ['value'] as unknown[],
            filters: [],
        }
        it('should return false if filter and no data', () => {
            const data = null as unknown as Record<string, unknown>
            assert.deepStrictEqual(
                { result: false },
                checkCustomData(data, filterStr),
            )
        })
        it('should return true if string value is equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> strKey' },
                checkCustomData({ strKey: 'value' }, filterStr),
            )
        })
        it('should return true if string is one OR value', () => {
            const filter = { ...filterStr }
            filter.values = ['value', 'value too']
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> strKey' },
                checkCustomData({ strKey: 'value' }, filter),
            )
        })
        it('should return false if string value is not equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ strKey: 'not value' }, filterStr),
            )
        })
        it('should return false if string value isnt present', () => {
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({}, filterStr),
            )
        })
        it('should return true if string is not equal to multiple values', () => {
            const filter = {
                ...filterStr,
                comparator: '!=',
                values: ['value1', 'value2', 'value3'],
            }
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> strKey' },
                checkCustomData({ strKey: 'value' }, filter),
            )
        })

        const filterNum = { ...filterStr }
        filterNum.dataKey = 'numKey'
        filterNum.dataKeyType = 'Number'
        filterNum.values = [0]
        it('should return true if number value is equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 0 }, filterNum),
            )
        })
        it('should return true if number is one OR value', () => {
            const filter = { ...filterNum }
            filter.values = [0, 1]
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 1 }, filter),
            )
        })

        it('should return false if number value is not equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 1 }, filterNum),
            )
        })

        it('should return false when num is in values for != comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            filter.values = [0, 1]
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 1 }, filter),
            )
        })

        it('should return true when num isnt in values for != comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            filter.values = [0, 1]
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 12 }, filter),
            )
        })

        it('should work for num for > comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '>'
            filter.values = [4, 10]
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 12 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 5 }, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 4 }, filter),
            )
        })

        it('should work for num for >= comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '>='
            filter.values = [4, 10]
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 12 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 5 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 4 }, filter),
            )
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 3 }, filter),
            )
        })

        it('should work for num for < comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '<'
            filter.values = [4, 10]
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 12 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 5 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 3 }, filter),
            )
        })

        it('should work for num for <= comparator', () => {
            const filter = { ...filterNum }
            filter.comparator = '<='
            filter.values = [4, 10]
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ numKey: 12 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 10 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 5 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 4 }, filter),
            )
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData({ numKey: 3 }, filter),
            )
        })

        const filterBool = { ...filterStr }
        filterBool.dataKey = 'boolKey'
        filterBool.dataKeyType = 'Boolean'
        filterBool.values = [false]
        it('should return true if bool value is equal', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> boolKey' },
                checkCustomData({ boolKey: false }, filterBool),
            )
        })
        it('should return false if bool value is not equal', () => {
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ boolKey: true }, filterBool),
            )
        })
        it('should return true if all filters are equal', () => {
            const operatorFilter = {
                filters: [filterStr, filterNum, filterBool],
                operator: 'and',
            } as unknown
            assert.deepStrictEqual(
                {
                    result: true,
                    reasonDetails:
                        'Custom Data -> strKey AND Custom Data -> numKey AND Custom Data -> boolKey',
                },
                evaluateOperator({
                    data: {
                        customData: {
                            strKey: 'value',
                            numKey: 0,
                            boolKey: false,
                        },
                    },
                    operator: operatorFilter,
                }),
            )
        })
        it('should return false if one custom data key is missing', () => {
            const operatorFilter = {
                filters: [filterStr, filterNum, filterBool],
                operator: 'and',
            } as unknown
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter,
                }),
            )
        })

        it('should return true if one custom data key is missing with not equal filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and',
            } as unknown
            assert.deepStrictEqual(
                {
                    result: true,
                    reasonDetails:
                        'Custom Data -> strKey AND Custom Data -> numKey AND Custom Data -> boolKey',
                },
                evaluateOperator({
                    data: { customData: { strKey: 'value', boolKey: false } },
                    operator: operatorFilter,
                }),
            )
        })

        it('should return true if no custom data is provided with not equal filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const data = null as unknown as Record<string, unknown>
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData(data, filter),
            )
        })

        it('should return true if no custom data is provided with not exists filter value', () => {
            const filter = { ...filterNum }
            filter.comparator = '!exist'

            const data = null as unknown as Record<string, unknown>
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> numKey' },
                checkCustomData(data, filter),
            )
        })

        it('should return false if no custom data is provided with not equal filter and others', () => {
            const filter = { ...filterNum }
            filter.comparator = '!='
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and',
            } as unknown
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({
                    data: { customData: null },
                    operator: operatorFilter,
                }),
            )
        })

        it('should return false if no custom data is provided with not exists filter and others', () => {
            const filter = { ...filterNum }
            filter.comparator = '!exist'
            const operatorFilter = {
                filters: [filterStr, filter, filterBool],
                operator: 'and',
            } as unknown
            assert.deepStrictEqual(
                { result: false },
                evaluateOperator({
                    data: { customData: null },
                    operator: operatorFilter,
                }),
            )
        })

        const containsFilter = {
            comparator: 'contain',
            type: 'user',
            subType: 'customData',
            dataKey: 'last_order_no',
            dataKeyType: 'String',
            values: ['FP'],
        }
        it('should return true if custom data contains value', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> last_order_no' },
                checkCustomData({ last_order_no: 'FP2423423' }, containsFilter),
            )
        })

        const existsFilter = {
            comparator: 'exist',
            type: 'user',
            subType: 'customData',
            dataKey: 'field',
            dataKeyType: 'String',
            values: [],
        }
        it('should return true if custom data value exists', () => {
            assert.deepStrictEqual(
                { result: true, reasonDetails: 'Custom Data -> field' },
                checkCustomData({ field: 'something' }, existsFilter),
            )
        })

        it('should return false if custom data value does not exist', () => {
            assert.deepStrictEqual(
                { result: false },
                checkCustomData({ not_field: 'something' }, existsFilter),
            )
        })
    })

    describe('filterAudiencesFromSubtypes', () => {
        const audiences = [
            {
                _id: '60cca1d8230f17002542b909',
                filters: {
                    filters: [
                        {
                            values: ['Android', 'Fire TV', 'Android TV'],
                            comparator: '=',
                            subType: 'platform',
                            type: 'user',
                        },
                    ],
                    operator: 'and',
                },
            },
            {
                _id: '60cca1d8230f17002542b910',
                filters: {
                    filters: [
                        {
                            values: ['Fire TV', 'Android TV'],
                            comparator: '=',
                            subType: 'platform',
                            type: 'user',
                        },
                    ],
                    operator: 'and',
                },
            },
            {
                _id: '60cca1d8230f17002542b911',
                filters: {
                    filters: [
                        {
                            values: ['Android TV'],
                            comparator: '=',
                            subType: 'platform',
                            type: 'user',
                        },
                    ],
                    operator: 'and',
                },
            },
            {
                _id: '60cca1d8230f17002542b912',
                filters: {
                    filters: [
                        {
                            values: ['Android'],
                            comparator: '=',
                            subType: 'platform',
                            type: 'user',
                        },
                    ],
                    operator: 'and',
                },
            },
            {
                _id: '60cca1d8230f17002542b913',
                filters: {
                    filters: [
                        {
                            values: ['iOS'],
                            comparator: '=',
                            subType: 'platform',
                            type: 'user',
                        },
                    ],
                    operator: 'and',
                },
            },
        ]
        it('should filter all Android TV audiences properly if it is included in data', () => {
            const data = {}
            setPlatformDataJSON({
                ...defaultPlatformData,
                platform: 'Android TV',
            })
            const filteredAudiences = audiences.filter((aud) => {
                const evalResult = evaluateOperator({
                    operator: aud.filters,
                    data,
                })
                return evalResult.result
            })
            expect(filteredAudiences.length).toEqual(3)
            expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b909')
            expect(filteredAudiences[1]._id).toEqual('60cca1d8230f17002542b910')
            expect(filteredAudiences[2]._id).toEqual('60cca1d8230f17002542b911')
        })
        it('should filter experiment with iOS properly', () => {
            const data = {
                user_id: 'some_id',
            }
            setPlatformDataJSON({ ...defaultPlatformData, platform: 'iOS' })
            const filteredAudiences = audiences.filter((aud) => {
                const evalResult = evaluateOperator({
                    operator: aud.filters,
                    data,
                })
                return evalResult.result
            })
            expect(filteredAudiences.length).toEqual(1)
            expect(filteredAudiences[0]._id).toEqual('60cca1d8230f17002542b913')
        })
    })
})
