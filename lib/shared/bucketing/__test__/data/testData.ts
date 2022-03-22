import {
    ConfigBody,
    PublicAudience,
    PublicEnvironment,
    PublicProject,
    PublicVariable,
    PublicVariation,
    AudienceOperator,
    FilterComparator,
    FeatureType,
    FilterType,
    UserSubType,
    VariableType
} from '@devcycle/types'

import moment from 'moment'

export const project: PublicProject = {
    _id: '61535533396f00bab586cb17',
    key: 'test-project',
    a0_organization: 'org_12345612345'
}

export const environment: PublicEnvironment = {
    _id: '6153553b8cf4e45e0464268d',
    key: 'test-environment'
}

export const audiences: PublicAudience[] = [
    {
        _id: '614ef6ea475929459060721a',
        filters: {
            filters: [{
                type: FilterType.user,
                subType: UserSubType.email,
                comparator: FilterComparator['='],
                values: ['test@email.com', 'test2@email.com']
            }],
            operator: AudienceOperator.and
        }
    },
    {
        _id: '6153557f1ed7bac7268ea0d9',
        filters: {
            filters: [{
                type: FilterType.user,
                subType: UserSubType.user_id,
                comparator: FilterComparator['='],
                values: ['asuh']
            },
            {
                type: FilterType.user,
                subType: UserSubType.country,
                comparator: FilterComparator['!='],
                values: ['U S AND A']
            }],
            operator: AudienceOperator.and
        }
    },
    {
        _id: '6153557f1ed7bac7268ea0d5',
        filters: {
            filters: [{
                type: FilterType.user,
                subType: UserSubType.platformVersion,
                comparator: FilterComparator['>'],
                values: ['1.1.1']
            },
            {
                type: FilterType.user,
                subType: UserSubType.customData,
                dataKey: 'favouriteFood',
                comparator: FilterComparator['='],
                values: ['pizza']
            },
            {
                type: FilterType.user,
                subType: UserSubType.customData,
                dataKey: 'favouriteDrink',
                comparator: FilterComparator['='],
                values: ['coffee']
            }],
            operator: AudienceOperator.and
        }
    },
    {
        _id: '6153557f1ed7bac7268ea0d6',
        filters: {
            filters: [{
                type: FilterType.user,
                subType: UserSubType.customData,
                dataKey: 'favouriteNumber',
                comparator: FilterComparator['='],
                values: [610]
            }, {
                type: FilterType.user,
                subType: UserSubType.customData,
                dataKey: 'favouriteBoolean',
                comparator: FilterComparator['='],
                values: [true, false]
            }],
            operator: AudienceOperator.and
        }
    }
]

export const variables: PublicVariable[] = [
    {
        _id: '614ef6ea475129459160721a',
        type: VariableType.string,
        key: 'test'
    },
    {
        _id: '615356f120ed334a6054564c',
        type: VariableType.string,
        key: 'swagTest'
    },
    {
        _id: '61538237b0a70b58ae6af71f',
        type: VariableType.string,
        key: 'feature2Var'
    },
    {
        _id: '61538237b0a70b58ae6af71g',
        type: VariableType.string,
        key: 'feature2.cool'
    },
    {
        _id: '61538237b0a70b58ae6af71h',
        type: VariableType.string,
        key: 'feature2.hello'
    }
]

export const variations: PublicVariation[] = [
    {
        _id: '6153553b8cf4e45e0464268d',
        name: 'variation 1',
        variables: [{
            _var: variables[0]._id,
            value: 'scat'
        },
        {
            _var: variables[1]._id,
            value: 'man'
        }]
    }, {
        _id: '615357cf7e9ebdca58446ed0',
        name: 'variation 2',
        variables: [
            {
                _var: variables[1]._id,
                value: 'YEEEEOWZA'
            }]
    },
    {
        _id: '615382338424cb11646d7667',
        name: 'variation 1 aud 2',
        variables: [
            {
                _var: variables[2]._id,
                value: 'Var 1 aud 2'
            }]
    },
    {
        _id: '615382338424cb11646d7668',
        name: 'feature 2 variation',
        variables: [
            {
                _var: variables[3]._id,
                value: 'multivar first'
            },
            {
                _var: variables[4]._id,
                value: 'multivar last'
            }
        ]
    },
    {
        _id: '615382338424cb11646d7668',
        name: 'feature 2 never used variation',
        variables: [
            {
                _var: variables[3]._id,
                value: 'multivar first unused'
            },
            {
                _var: variables[4]._id,
                value: 'multivar last unused'
            }
        ]
    },
    {
        _id: '615382338424cb11646d7660',
        name: 'feature 2 never used variation, bool',
        variables: [
            {
                _var: variables[3]._id,
                value: true
            },
            {
                _var: variables[4]._id,
                value: false
            }
        ]
    },
    {
        _id: '615382338424cb11646d7661',
        name: 'feature 2 never used variation, number',
        variables: [
            {
                _var: variables[3]._id,
                value: 610
            },
            {
                _var: variables[4]._id,
                value: 1114
            }
        ]
    }
]

export const variableHashes: ConfigBody['variableHashes'] = {
    'test': 3126796075,
    'swagTest': 2547774734,
    'feature2Var': 1879689550,
    'feature2.cool': 2621975932,
    'feature2.hello': 4138596111
}

export const config: ConfigBody = {
    project,
    environment,
    features: [
        {
            _id: '614ef6aa473928459060721a',
            type: FeatureType.release,
            key: 'feature1',
            configuration: {
                _id: '614ef6ea475328459060721a',
                targets: [{
                    _id: '61536f3bc838a705c105eb62',
                    _audience: audiences[0],
                    distribution: [{
                        _variation: variations[0]._id,
                        percentage: 0.5
                    }, {
                        _variation: variations[1]._id,
                        percentage: 0.5
                    }]
                }, {
                    _id: '61536f468fd67f0091982533',
                    _audience: audiences[1],
                    distribution: [{
                        _variation: variations[1]._id,
                        percentage: 1
                    }]
                }, {
                    _id: '61536f468fd67f0091982534',
                    _audience: audiences[2],
                    rollout: {
                        type: 'gradual',
                        startPercentage: 0,
                        startDate: moment().subtract(1, 'days').toDate(),
                        stages: [
                            {
                                type: 'linear',
                                percentage: 1,
                                date: moment().add(1, 'days').toDate()
                            }
                        ]
                    },
                    distribution: [{
                        _variation: variations[1]._id,
                        percentage: 1
                    }]
                }]
            },
            variations: [variations[0], variations[1]]
        },
        {
            _id: '614ef6aa475928459060721a',
            type: FeatureType.release,
            key: 'feature2',
            configuration: {
                _id: '61536f62502d80fff97ed649',
                targets: [{
                    _id: '61536f468fd67f0091982533',
                    _audience: audiences[0],
                    distribution: [{
                        _variation: variations[3]._id,
                        percentage: 1
                    },
                    {
                        _variation: variations[4]._id,
                        percentage: 0
                    }]
                }, {
                    _id: '61536f669c69b86cccc5f15e',
                    _audience: audiences[2],
                    distribution: [{
                        _variation: variations[2]._id,
                        percentage: 1
                    }]
                }]
            },
            variations: [variations[0], variations[1], variations[2], variations[3], variations[4]]
        }],
    variables,
    variableHashes
}

export const barrenConfig: ConfigBody = {
    project,
    environment,
    features: [
        {
            _id: '614ef6aa473928459060721a',
            type: FeatureType.release,
            key: 'feature1',
            configuration: {
                _id: '614ef6ea475328459060721a',
                targets: [{
                    _id: '61536f3bc838a705c105eb62',
                    _audience: audiences[0],
                    distribution: []
                },{
                    _id: '61536f3bc838a705c105eb62',
                    _audience: audiences[2],
                    distribution: [{
                        _variation: variations[2]._id,
                        percentage: 1
                    }]
                }]
            },
            variations: [variations[0], variations[1]]
        },
        {
            _id: '614ef6aa475928459060721a',
            type: FeatureType.release,
            key: 'feature2',
            configuration: {
                _id: '61536f62502d80fff97ed649',
                targets: [{
                    _id: '61536f468fd67f0091982533',
                    _audience: audiences[1],
                    distribution: [{
                        _variation: variations[3]._id,
                        percentage: 1
                    },
                    {
                        _variation: variations[4]._id,
                        percentage: 0
                    }]
                }, {
                    _id: '61536f669c69b86cccc5f15e',
                    _audience: audiences[2],
                    distribution: [{
                        _variation: variations[2]._id,
                        percentage: 1
                    }]
                }]
            },
            variations: [variations[0], variations[1], variations[2], variations[3], variations[4]]
        }],
    variables: [],
    variableHashes: {}

}
