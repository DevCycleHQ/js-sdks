import {
    AudienceOperator,
    ConfigBody,
    DataKeyType,
    FeatureType,
    FilterComparator,
    FilterType,
    PublicAudience,
    PublicEnvironment,
    PublicProject,
    PublicVariable,
    PublicVariation,
    TargetAudience,
    UserSubType,
    VariableType,
} from '@devcycle/types'

import moment from 'moment'

export const project: PublicProject = {
    _id: '61535533396f00bab586cb17',
    key: 'test-project',
    a0_organization: 'org_12345612345',
    settings: {
        edgeDB: {
            enabled: false,
        },
        disablePassthroughRollouts: false,
    },
}

export const environment: PublicEnvironment = {
    _id: '6153553b8cf4e45e0464268d',
    key: 'test-environment',
}

export const reusableAudiences: PublicAudience[] = [
    {
        _id: '614ef6ea475929459060721a',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.email,
                    comparator: FilterComparator['='],
                    values: ['test@email.com', 'test2@email.com'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
]

export const reusableTopLevelOrAudience: PublicAudience[] = [
    {
        _id: '614ef6ea475929459060721b',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.user_id,
                    comparator: FilterComparator['='],
                    values: ['A', 'B', 'C', 'D'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.email,
                    comparator: FilterComparator['='],
                    values: ['email@email.com'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.appVersion,
                    comparator: FilterComparator['>'],
                    values: ['0.1.0'],
                },
            ],
            operator: AudienceOperator.or,
        },
    },
]

export const nestedOrAudience: PublicAudience[] = [
    {
        _id: '614ef6ea475929459060721c',
        filters: {
            filters: [
                {
                    filters: [
                        {
                            type: FilterType.user,
                            subType: UserSubType.user_id,
                            comparator: FilterComparator['='],
                            values: ['A', 'B', 'C', 'D'],
                        },
                        {
                            type: FilterType.user,
                            subType: UserSubType.customData,
                            dataKey: 'favouriteFood',
                            dataKeyType: DataKeyType.string,
                            comparator: FilterComparator['='],
                            values: ['pizza'],
                        },
                    ],
                    operator: AudienceOperator.or,
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.email,
                    comparator: FilterComparator['='],
                    values: ['email@email.com'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.appVersion,
                    comparator: FilterComparator['>'],
                    values: ['0.0.0'],
                },
            ],
            operator: AudienceOperator.or,
        },
    },
]

export const audiences: TargetAudience[] = [
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.email,
                    comparator: FilterComparator['='],
                    values: ['test@email.com', 'test2@email.com'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    filters: [
                        {
                            type: FilterType.user,
                            subType: UserSubType.user_id,
                            comparator: FilterComparator['='],
                            values: ['asuh'],
                        },
                        {
                            type: FilterType.user,
                            subType: UserSubType.country,
                            comparator: FilterComparator['!='],
                            values: ['U S AND A'],
                        },
                    ],
                    operator: AudienceOperator.and,
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.user_id,
                    comparator: FilterComparator['='],
                    values: ['asuh'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.country,
                    comparator: FilterComparator['!='],
                    values: ['U S AND A'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.platformVersion,
                    comparator: FilterComparator['>'],
                    values: ['1.1.1'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteFood',
                    dataKeyType: DataKeyType.string,
                    comparator: FilterComparator['='],
                    values: ['pizza'],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteDrink',
                    dataKeyType: DataKeyType.string,
                    comparator: FilterComparator['='],
                    values: ['coffee'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteNumber',
                    dataKeyType: DataKeyType.number,
                    comparator: FilterComparator['='],
                    values: [610],
                },
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteBoolean',
                    dataKeyType: DataKeyType.boolean,
                    comparator: FilterComparator['='],
                    values: [true, false],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.audienceMatch,
                    comparator: FilterComparator['='],
                    _audiences: ['614ef6ea475929459060721a'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteNull',
                    dataKeyType: DataKeyType.string,
                    comparator: FilterComparator['exist'],
                    values: [],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.customData,
                    dataKey: 'favouriteNull',
                    dataKeyType: DataKeyType.string,
                    comparator: FilterComparator['!exist'],
                    values: [],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.all,
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.user,
                    subType: UserSubType.email,
                    comparator: FilterComparator['='],
                    values: ['testwithfood@email.com'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.audienceMatch,
                    comparator: FilterComparator['='],
                    // Top Level OR audience
                    _audiences: ['614ef6ea475929459060721b'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
    {
        _id: '',
        filters: {
            filters: [
                {
                    type: FilterType.audienceMatch,
                    comparator: FilterComparator['='],
                    // Nested OR audience
                    _audiences: ['614ef6ea475929459060721c'],
                },
            ],
            operator: AudienceOperator.and,
        },
    },
]

export const variables: PublicVariable[] = [
    {
        _id: '614ef6ea475129459160721a',
        type: VariableType.string,
        key: 'test',
    },
    {
        _id: '615356f120ed334a6054564c',
        type: VariableType.string,
        key: 'swagTest',
    },
    {
        _id: '61538237b0a70b58ae6af71f',
        type: VariableType.string,
        key: 'feature2Var',
    },
    {
        _id: '61538237b0a70b58ae6af71g',
        type: VariableType.string,
        key: 'feature2.cool',
    },
    {
        _id: '61538237b0a70b58ae6af71h',
        type: VariableType.string,
        key: 'feature2.hello',
    },
    {
        _id: '61538237b0a70b58ae6af71z',
        type: VariableType.string,
        key: 'audience-match',
    },
    {
        _id: '61538237b0a70b58ae6af71y',
        type: VariableType.boolean,
        key: 'bool-var',
    },
    {
        _id: '61538237b0a70b58ae6af71s',
        type: VariableType.number,
        key: 'num-var',
    },
    {
        _id: '61538237b0a70b58ae6af71q',
        type: VariableType.json,
        key: 'json-var',
    },
    {
        _id: '61538937b0a70b58ae6af71f',
        type: VariableType.string,
        key: 'feature4Var',
    },
]

export const variations: PublicVariation[] = [
    {
        _id: '6153553b8cf4e45e0464268d',
        name: 'variation 1',
        key: 'variation-1-key',
        variables: [
            {
                _var: variables[0]._id,
                value: 'scat',
            },
            {
                _var: variables[1]._id,
                value: 'man',
            },
            {
                _var: variables[6]._id,
                value: false,
            },
            {
                _var: variables[7]._id,
                value: 610.61,
            },
            {
                _var: variables[8]._id,
                value: '{"hello":"world","num":610,"bool":true}',
            },
        ],
    },
    {
        _id: '615357cf7e9ebdca58446ed0',
        name: 'variation 2',
        key: 'variation-2-key',
        variables: [
            {
                _var: variables[1]._id,
                value: 'YEEEEOWZA',
            },
            {
                _var: variables[6]._id,
                value: false,
            },
            {
                _var: variables[7]._id,
                value: 610.61,
            },
            {
                _var: variables[8]._id,
                value: '{"hello":"world","num":610,"bool":true}',
            },
        ],
    },
    {
        _id: '615382338424cb11646d7667',
        name: 'variation 1 aud 2',
        key: 'variation-1-aud-2-key',
        variables: [
            {
                _var: variables[2]._id,
                value: 'Var 1 aud 2',
            },
        ],
    },
    {
        _id: '615382338424cb11646d7668',
        name: 'feature 2 variation',
        key: 'variation-feature-2-key',
        variables: [
            {
                _var: variables[3]._id,
                value: 'multivar first',
            },
            {
                _var: variables[4]._id,
                value: 'multivar last',
            },
        ],
    },
    {
        _id: '615382338424cb11646d7669',
        name: 'feature 2 never used variation',
        key: 'variation-never-used-key',
        variables: [
            {
                _var: variables[3]._id,
                value: 'multivar first unused',
            },
            {
                _var: variables[4]._id,
                value: 'multivar last unused',
            },
        ],
    },
    {
        _id: '615382338424cb11646d7662',
        name: 'audience match variation',
        key: 'audience-match-variation',
        variables: [
            {
                _var: variables[5]._id,
                value: 'audience_match',
            },
        ],
    },
    {
        _id: '615382338424cb11646d7660',
        name: 'feature 2 never used variation, bool',
        key: 'variation-bool-key',
        variables: [
            {
                _var: variables[3]._id,
                value: true,
            },
            {
                _var: variables[4]._id,
                value: false,
            },
        ],
    },
    {
        _id: '615382338424cb11646d7661',
        name: 'feature 2 never used variation, number',
        key: 'variation-number-key',
        variables: [
            {
                _var: variables[3]._id,
                value: 610,
            },
            {
                _var: variables[4]._id,
                value: 1114,
            },
        ],
    },
    {
        _id: '615382338424cb11646d9668',
        name: 'feature 4 variation',
        key: 'variation-feature-2-key',
        variables: [
            {
                _var: variables[9]._id,
                value: 'feature 4 value',
            },
        ],
    },
]

export const variableHashes: ConfigBody['variableHashes'] = {
    test: 3126796075,
    swagTest: 2547774734,
    feature2Var: 1879689550,
    'feature2.cool': 2621975932,
    'feature2.hello': 4138596111,
}

function configBodyAudiences(audiences: PublicAudience[]): {
    [id: string]: Omit<PublicAudience<string>, '_id'>
} {
    const auds: { [id: string]: Omit<PublicAudience<string>, '_id'> } = {}
    audiences.forEach((aud: PublicAudience) => {
        const { _id, ...rest } = aud
        auds[aud._id] = {
            ...rest,
        }
    })
    return auds
}

export const config: ConfigBody = {
    project,
    environment,
    audiences: configBodyAudiences(reusableAudiences),
    features: [
        {
            _id: '614ef6aa473928459060721a',
            type: FeatureType.release,
            key: 'feature1',
            configuration: {
                _id: '614ef6ea475328459060721a',
                targets: [
                    {
                        _id: '61536f3bc838a705c105eb62',
                        _audience: audiences[0],
                        distribution: [
                            {
                                _variation: variations[0]._id,
                                percentage: 0.6667,
                            },
                            {
                                _variation: variations[1]._id,
                                percentage: 0.3333,
                            },
                        ],
                    },
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[1],
                        distribution: [
                            {
                                _variation: variations[1]._id,
                                percentage: 1,
                            },
                        ],
                    },
                    {
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
                                    date: moment().add(1, 'days').toDate(),
                                },
                            ],
                        },
                        distribution: [
                            {
                                _variation: variations[1]._id,
                                percentage: 1,
                            },
                        ],
                    },
                    {
                        _id: '61536f468fd67f0091982535',
                        _audience: audiences[7],
                        distribution: [
                            {
                                _variation: variations[0]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[0], variations[1]],
        },
        {
            _id: '614ef6aa475928459060721a',
            type: FeatureType.release,
            key: 'feature2',
            configuration: {
                _id: '61536f62502d80fff97ed649',
                targets: [
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[0],
                        distribution: [
                            {
                                _variation: variations[3]._id,
                                percentage: 1,
                            },
                            {
                                _variation: variations[4]._id,
                                percentage: 0,
                            },
                        ],
                    },
                    {
                        _id: '61536f669c69b86cccc5f15e',
                        _audience: audiences[2],
                        distribution: [
                            {
                                _variation: variations[2]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [
                variations[0],
                variations[1],
                variations[2],
                variations[3],
                variations[4],
            ],
        },
        {
            _id: '614ef6aa475928459060721c',
            type: FeatureType.release,
            key: 'feature3',
            configuration: {
                _id: '61536f62502d80fff97ed640',
                targets: [
                    {
                        _id: '61536f468fd67f0091982531',
                        _audience: audiences[4],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
        {
            _id: '614ef8aa475928459060721c',
            type: FeatureType.release,
            key: 'feature4',
            configuration: {
                _id: '61536f62502d80fff97ed640',
                targets: [
                    {
                        _id: '61536f468fd67f0091982531',
                        _audience: audiences[0],
                        distribution: [
                            {
                                _variation: variations[8]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[8]],
        },
        {
            _id: '614ef8aa475928459060721d',
            type: FeatureType.release,
            key: 'feature5',
            configuration: {
                _id: '61536f62502d80fff97ed641',
                targets: [
                    {
                        _id: '61536f468fd67f0091982532',
                        _audience: audiences[8],
                        distribution: [
                            {
                                _variation: variations[0]._id,
                                percentage: 0.2222,
                            },
                            {
                                _variation: variations[1]._id,
                                percentage: 0.2222,
                            },
                            {
                                _variation: variations[2]._id,
                                percentage: 0.2222,
                            },
                            {
                                _variation: variations[3]._id,
                                percentage: 0.2222,
                            },
                            {
                                _variation: variations[4]._id,
                                percentage: 0.1112,
                            },
                        ],
                    },
                ],
            },
            variations: [
                variations[0],
                variations[1],
                variations[2],
                variations[3],
                variations[4],
            ],
        },
    ],
    variables,
    variableHashes,
    clientSDKKey: 'test',
}

export const barrenConfig: ConfigBody = {
    project,
    environment,
    audiences: {},
    features: [
        {
            _id: '614ef6aa473928459060721a',
            type: FeatureType.release,
            key: 'feature1',
            configuration: {
                _id: '614ef6ea475328459060721a',
                targets: [
                    {
                        _id: '61536f3bc838a705c105eb62',
                        _audience: audiences[0],
                        distribution: [],
                    },
                    {
                        _id: '61536f3bc838a705c105eb63',
                        _audience: audiences[2],
                        distribution: [
                            {
                                _variation: variations[2]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[0], variations[1]],
        },
        {
            _id: '614ef6aa475928459060721a',
            type: FeatureType.release,
            key: 'feature2',
            configuration: {
                _id: '61536f62502d80fff97ed649',
                targets: [
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[1],
                        distribution: [
                            {
                                _variation: variations[3]._id,
                                percentage: 1,
                            },
                            {
                                _variation: variations[4]._id,
                                percentage: 0,
                            },
                        ],
                    },
                    {
                        _id: '61536f669c69b86cccc5f15e',
                        _audience: audiences[2],
                        distribution: [
                            {
                                _variation: variations[2]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [
                variations[0],
                variations[1],
                variations[2],
                variations[3],
                variations[4],
            ],
        },
    ],
    variables: [],
    variableHashes: {},
}

export const configWithNullCustomData: ConfigBody = {
    project,
    environment,
    audiences: configBodyAudiences(reusableAudiences),
    features: [
        {
            _id: '614ef6aa475928459060721d',
            type: FeatureType.permission,
            key: 'feature4',
            configuration: {
                _id: '61536f62502d80fff97ed641',
                targets: [
                    {
                        _id: '61536f468fd67f0091982532',
                        _audience: audiences[5],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
        {
            _id: '614ef6aa475928459060721d',
            type: FeatureType.ops,
            key: 'feature5',
            configuration: {
                _id: '61536f62502d80fff97ed642',
                targets: [
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[6],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
    ],
    variables,
    variableHashes,
    clientSDKKey: 'test',
}

export const configWithTopLevelOrAudience: ConfigBody = {
    project,
    environment,
    audiences: configBodyAudiences(reusableTopLevelOrAudience),
    features: [
        {
            _id: '614ef6aa475928459060721d',
            type: FeatureType.permission,
            key: 'feature4',
            configuration: {
                _id: '61536f62502d80fff97ed641',
                targets: [
                    {
                        _id: '61536f468fd67f0091982532',
                        _audience: audiences[5],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
        {
            _id: '614ef6aa475928459060721e',
            type: FeatureType.ops,
            key: 'top_level_or_feature',
            configuration: {
                _id: '61536f62502d80fff97ed642',
                targets: [
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[9],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
    ],
    variables,
    variableHashes,
}

export const configWithNestedOrAudience: ConfigBody = {
    project,
    environment,
    audiences: configBodyAudiences(nestedOrAudience),
    features: [
        {
            _id: '614ef6aa475928459060721d',
            type: FeatureType.permission,
            key: 'nested_or_feature',
            configuration: {
                _id: '61536f62502d80fff97ed641',
                targets: [
                    {
                        _id: '61536f468fd67f0091982533',
                        _audience: audiences[10],
                        distribution: [
                            {
                                _variation: variations[5]._id,
                                percentage: 1,
                            },
                        ],
                    },
                ],
            },
            variations: [variations[5]],
        },
    ],
    variables,
    variableHashes,
}

export const configWithBucketingKey = (bucketingKey: string): ConfigBody => ({
    ...config,
    features: config.features.map((feature) => ({
        ...feature,
        configuration: {
            ...feature.configuration,
            targets: feature.configuration.targets.map((target) => {
                return {
                    ...target,
                    bucketingKey,
                }
            }),
        },
    })),
})
