/* eslint-disable max-len */
import {
    Audience,
    AudienceOperator,
    EVAL_REASONS,
    EvalReason,
    FeatureType,
    FilterType,
    PublicRollout,
    Rollout,
} from '@devcycle/types'
import {
    generateBoundedHashes,
    decideTargetVariation,
    generateBucketedConfig,
    doesUserPassRollout,
} from '../src/bucketing'
import {
    config,
    barrenConfig,
    configWithNullCustomData,
    configWithBucketingKey,
    configWithNestedOrAudience,
    configWithTopLevelOrAudience,
} from '@devcycle/bucketing-test-data'

import moment from 'moment'
import times from 'lodash/times'
import filter from 'lodash/filter'
import * as uuid from 'uuid'

describe('User Hashing and Bucketing', () => {
    it('generates buckets approximately in the same distribution as the variation distributions', () => {
        const buckets: { variation: string; evalReason?: EvalReason }[] = []
        const testTarget = {
            _audience: { _id: 'id', filters: [] } as unknown as Audience,
            _id: 'target',
            distribution: [
                { _variation: 'var1', percentage: 0.2555 },
                { _variation: 'var2', percentage: 0.4445 },
                { _variation: 'var4', percentage: 0.2 },
                { _variation: 'var3', percentage: 0.1 },
            ],
        }

        // run 200,000 times to get a good distribution
        times(200000, () => {
            const user_id = uuid.v4()
            const { bucketingHash } = generateBoundedHashes(
                user_id,
                testTarget._id,
            )
            buckets.push(
                decideTargetVariation({
                    target: testTarget,
                    boundedHash: bucketingHash,
                }),
            )
        })

        const var1 = filter(buckets, (bucket) => bucket.variation === 'var1')
        const var2 = filter(buckets, (bucket) => bucket.variation === 'var2')
        const var3 = filter(buckets, (bucket) => bucket.variation === 'var3')
        const var4 = filter(buckets, (bucket) => bucket.variation === 'var4')

        expect(var1.length / buckets.length).toBeGreaterThan(0.2525)
        expect(var1.length / buckets.length).toBeLessThan(0.2575)
        expect(var2.length / buckets.length).toBeGreaterThan(0.4425)
        expect(var2.length / buckets.length).toBeLessThan(0.4475)
        expect(var4.length / buckets.length).toBeGreaterThan(0.19)
        expect(var4.length / buckets.length).toBeLessThan(0.21)
        expect(var3.length / buckets.length).toBeGreaterThan(0.09)
        expect(var3.length / buckets.length).toBeLessThan(0.11)
    })

    it('that bucketing hash yields the same hash for user_id', () => {
        const user_id = uuid.v4()
        const { bucketingHash } = generateBoundedHashes(user_id, 'fake')
        const { bucketingHash: bucketingHash2 } = generateBoundedHashes(
            user_id,
            'fake',
        )
        expect(bucketingHash).toBe(bucketingHash2)
    })

    it('generates different hashes for different target_id seeds', () => {
        const user_id = uuid.v4()
        const { bucketingHash } = generateBoundedHashes(user_id, 'fake')
        const { bucketingHash: bucketingHash2 } = generateBoundedHashes(
            user_id,
            'fake2',
        )
        expect(bucketingHash).not.toBe(bucketingHash2)
    })

    it('should generate rollout hash deterministically', () => {
        const user_id = uuid.v4()
        const { rolloutHash } = generateBoundedHashes(user_id, 'fake')
        const { rolloutHash: rolloutHash2 } = generateBoundedHashes(
            user_id,
            'fake',
        )
        expect(rolloutHash).toBe(rolloutHash2)
    })

    it('generates different hashes for different rollout and bucketing', () => {
        const user_id = uuid.v4()
        const { rolloutHash, bucketingHash } = generateBoundedHashes(
            user_id,
            'fake',
        )
        expect(bucketingHash).not.toBe(rolloutHash)
    })
})

describe('Config Parsing and Generating', () => {
    it('generates the correctly modified config from the example config', () => {
        const user = {
            country: 'CA',
            user_id: 'asuh',
            email: 'test',
            platform: 'android',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    key: 'feature1',
                    type: FeatureType.release,
                    _variation: '615357cf7e9ebdca58446ed0',
                    variationName: 'variation 2',
                    variationKey: 'variation-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
            },
            variableVariationMap: {},
            variables: {
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'YEEEEOWZA',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('puts the user in the target for the first audience they match', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
                privateNull: null,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@email.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    key: 'feature1',
                    type: FeatureType.release,
                    _variation: '6153553b8cf4e45e0464268d',
                    variationName: 'variation 1',
                    variationKey: 'variation-1-key',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: FeatureType.release,
                    _variation: '615382338424cb11646d7668',
                    variationName: 'feature 2 variation',
                    variationKey: 'variation-feature-2-key',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                feature3: {
                    _id: '614ef6aa475928459060721c',
                    _variation: '615382338424cb11646d7662',
                    key: 'feature3',
                    type: 'release',
                    variationKey: 'audience-match-variation',
                    variationName: 'audience match variation',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Audience Match -> Email',
                        target_id: '61536f468fd67f0091982531',
                    },
                },
                feature4: {
                    _id: '614ef8aa475928459060721c',
                    _variation: '615382338424cb11646d9668',
                    key: 'feature4',
                    type: 'release',
                    variationKey: 'variation-feature-2-key',
                    variationName: 'feature 4 variation',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Email',
                        target_id: '61536f468fd67f0091982531',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7668',
                '614ef6aa475928459060721c': '615382338424cb11646d7662',
                '614ef8aa475928459060721c': '615382338424cb11646d9668',
            },
            variableVariationMap: {},
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    _feature: '614ef6aa475928459060721c',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Audience Match -> Email',
                        target_id: '61536f468fd67f0091982531',
                    },
                },
                'feature2.cool': {
                    _id: '61538237b0a70b58ae6af71g',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2.cool',
                    type: 'String',
                    value: 'multivar first',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'feature2.hello': {
                    _id: '61538237b0a70b58ae6af71h',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2.hello',
                    type: 'String',
                    value: 'multivar last',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    _feature: '614ef6aa473928459060721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: 'Random Distribution | Email',
                        target_id: '61536f3bc838a705c105eb62',
                    },
                },
                feature4Var: {
                    _id: '61538937b0a70b58ae6af71f',
                    _feature: '614ef8aa475928459060721c',
                    key: 'feature4Var',
                    type: 'String',
                    value: 'feature 4 value',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Email',
                        target_id: '61536f468fd67f0091982531',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('correctly buckets based on nested filters', () => {
        const user = {
            country: 'CA',
            user_id: 'asuh',
            platform: 'Android',
            email: 'test1@email.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    key: 'feature1',
                    settings: undefined,
                    type: FeatureType.release,
                    _variation: '615357cf7e9ebdca58446ed0',
                    variationName: 'variation 2',
                    variationKey: 'variation-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
            },
            variableVariationMap: {},
            variables: {
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'YEEEEOWZA',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'User ID AND Country',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('correctly doesnt bucket with nested filters', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            platform: 'Android',
            email: 'notthisemail@email.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
            },
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                    key: 'feature1',
                    type: 'release',
                    variationKey: 'variation-1-key',
                    variationName: 'variation 1',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
            },
            project: {
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
                settings: {
                    edgeDB: {
                        enabled: false,
                    },
                    disablePassthroughRollouts: false,
                },
            },
            variableVariationMap: {},
            variables: {
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    _feature: '614ef6aa473928459060721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('holds user in rollout if passthrough disabled', () => {
        const newConfig = {
            ...config,
            project: {
                ...config.project,
                settings: {
                    ...config.project.settings,
                    disablePassthroughRollouts: true,
                },
            },
        }
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
                privateNull: null,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: FeatureType.release,
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variableVariationMap: {},
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config: newConfig, user })
        expect(c).toEqual(expected)
    })

    it('pushes user to next target if not in rollout and passthrough undefined', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
                privateNull: null,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }

        const newConfig = {
            ...config,
            project: {
                ...config.project,
                settings: {
                    ...config.project.settings,
                    disablePassthroughRollouts: undefined,
                },
            },
        }

        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                    key: 'feature1',
                    settings: undefined,
                    type: 'release',
                    variationKey: 'variation-1-key',
                    variationName: 'variation 1',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: FeatureType.release,
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variableVariationMap: {},
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    _feature: '614ef6aa473928459060721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config: newConfig, user })
        expect(c).toEqual(expected)
    })

    it('pushes user to next target if not in rollout', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
                privateNull: null,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                    key: 'feature1',
                    settings: undefined,
                    type: 'release',
                    variationKey: 'variation-1-key',
                    variationName: 'variation 1',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: FeatureType.release,
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variableVariationMap: {},
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    _feature: '614ef6aa473928459060721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'All Users',
                        target_id: '61536f468fd67f0091982535',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('puts user through if in rollout', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza',
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    key: 'feature1',
                    type: FeatureType.release,
                    _variation: '615357cf7e9ebdca58446ed0',
                    variationName: 'variation 2',
                    variationKey: 'variation-2-key',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details:
                            'Rollout | Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f468fd67f0091982534',
                    },
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: FeatureType.release,
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variableVariationMap: {},
            variables: {
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    _feature: '614ef6aa473928459060721a',
                    key: 'swagTest',
                    type: 'String',
                    value: 'YEEEEOWZA',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details:
                            'Rollout | Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f468fd67f0091982534',
                    },
                },
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    _feature: '614ef6aa475928459060721a',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details:
                            'Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f669c69b86cccc5f15e',
                    },
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    _feature: '614ef6aa473928459060721a',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details:
                            'Rollout | Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f468fd67f0091982534',
                    },
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    _feature: '614ef6aa473928459060721a',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details:
                            'Rollout | Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f468fd67f0091982534',
                    },
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    _feature: '614ef6aa473928459060721a',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details:
                            'Rollout | Platform Version AND Custom Data -> favouriteFood AND Custom Data -> favouriteDrink',
                        target_id: '61536f468fd67f0091982534',
                    },
                },
            },
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('buckets a user with user_id if no bucketingKey', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza',
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }

        const cWithBucketingKey = configWithBucketingKey('user_id')
        const bucketedConfig = generateBucketedConfig({
            config: config,
            user,
        })

        const bucketedConfigFromBucketingKey = generateBucketedConfig({
            config: cWithBucketingKey,
            user,
        })
        expect(bucketedConfig).toEqual(bucketedConfigFromBucketingKey)
    })

    it('buckets a user with custom bucketingKey', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza',
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'testwithfood@email.com',
        }
        const sameUserDifferentFood = {
            ...user,
            customData: {
                favouriteFood: 'pasta',
            },
        }
        const differentUserSameFood = {
            ...sameUserDifferentFood,
            user_id: 'a_different_person',
        }
        const configBucketedByFood = configWithBucketingKey('favouriteFood')
        const bucketedConfigOrig = generateBucketedConfig({
            config: config,
            user,
        })
        const bucketedConfigByFood = generateBucketedConfig({
            config: configBucketedByFood,
            user,
        })
        const bucketedConfigSameUserDifferentFood = generateBucketedConfig({
            config: configBucketedByFood,
            user: sameUserDifferentFood,
        })
        const bucketedConfigDifferentUserSameFood = generateBucketedConfig({
            config: configBucketedByFood,
            user: differentUserSameFood,
        })
        expect(bucketedConfigOrig.features.feature5.variationKey).not.toEqual(
            bucketedConfigByFood.features.feature5.variationKey,
        )
        expect(bucketedConfigByFood.features.feature5.variationKey).not.toEqual(
            bucketedConfigSameUserDifferentFood.features.feature5.variationKey,
        )
        expect(
            bucketedConfigSameUserDifferentFood.features.feature5.variationKey,
        ).toEqual(
            bucketedConfigDifferentUserSameFood.features.feature5.variationKey,
        )
    })

    it('buckets a user with custom bucketingKey from privateCustomData', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            privateCustomData: {
                favouriteFood: 'pizza',
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'testwithfood@email.com',
        }
        const sameUserDifferentFood = {
            ...user,
            privateCustomData: {
                favouriteFood: 'meatballs',
            },
        }
        const differentUserSameFood = {
            ...sameUserDifferentFood,
            user_id: 'a_different_person',
        }
        const configBucketedByFood = configWithBucketingKey('favouriteFood')
        const bucketedConfigOrig = generateBucketedConfig({
            config: config,
            user,
        })
        const bucketedConfigByFood = generateBucketedConfig({
            config: configBucketedByFood,
            user,
        })
        const bucketedConfigSameUserDifferentFood = generateBucketedConfig({
            config: configBucketedByFood,
            user: sameUserDifferentFood,
        })
        const bucketedConfigDifferentUserSameFood = generateBucketedConfig({
            config: configBucketedByFood,
            user: differentUserSameFood,
        })
        expect(bucketedConfigOrig.features.feature5.variationKey).not.toEqual(
            bucketedConfigByFood.features.feature5.variationKey,
        )
        expect(bucketedConfigByFood.features.feature5.variationKey).not.toEqual(
            bucketedConfigSameUserDifferentFood.features.feature5.variationKey,
        )
        expect(
            bucketedConfigSameUserDifferentFood.features.feature5.variationKey,
        ).toEqual(
            bucketedConfigDifferentUserSameFood.features.feature5.variationKey,
        )
    })

    it('buckets a user with custom number bucketingKey', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            privateCustomData: {
                favouriteNumber: 610,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'testwithfood@email.com',
        }
        const sameUserDifferentNum = {
            ...user,
            privateCustomData: {
                favouriteNumber: 52900,
            },
        }
        const differentUserSameNum = {
            ...sameUserDifferentNum,
            user_id: 'a_different_person',
        }
        const configBucketedByNumber = configWithBucketingKey('favouriteNumber')
        const bucketedConfigOrig = generateBucketedConfig({
            config: config,
            user,
        })
        const bucketedConfigByNum = generateBucketedConfig({
            config: configBucketedByNumber,
            user,
        })
        const bucketedConfigSameUserDifferentNum = generateBucketedConfig({
            config: configBucketedByNumber,
            user: sameUserDifferentNum,
        })
        const bucketedConfigDifferentUserSameNum = generateBucketedConfig({
            config: configBucketedByNumber,
            user: differentUserSameNum,
        })
        expect(bucketedConfigOrig.features.feature5.variationKey).not.toEqual(
            bucketedConfigByNum.features.feature5.variationKey,
        )
        expect(bucketedConfigByNum.features.feature5.variationKey).not.toEqual(
            bucketedConfigSameUserDifferentNum.features.feature5.variationKey,
        )
        expect(
            bucketedConfigSameUserDifferentNum.features.feature5.variationKey,
        ).toEqual(
            bucketedConfigDifferentUserSameNum.features.feature5.variationKey,
        )
    })

    it('buckets a user with custom boolean bucketingKey', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            privateCustomData: {
                signed_up: true,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'testwithfood@email.com',
        }
        const sameUserDifferentNum = {
            ...user,
            privateCustomData: {
                signed_up: false,
            },
        }
        const differentUserSameNum = {
            ...sameUserDifferentNum,
            user_id: 'a_different_person',
        }
        const configBucketedByBool = configWithBucketingKey('signed_up')
        const bucketedConfigOrig = generateBucketedConfig({
            config: config,
            user,
        })
        const bucketedConfigByBool = generateBucketedConfig({
            config: configBucketedByBool,
            user,
        })
        const bucketedConfigSameUserDifferentBool = generateBucketedConfig({
            config: configBucketedByBool,
            user: sameUserDifferentNum,
        })
        const bucketedConfigDifferentUserSameBool = generateBucketedConfig({
            config: configBucketedByBool,
            user: differentUserSameNum,
        })
        expect(bucketedConfigOrig.features.feature5.variationKey).not.toEqual(
            bucketedConfigByBool.features.feature5.variationKey,
        )
        expect(bucketedConfigByBool.features.feature5.variationKey).not.toEqual(
            bucketedConfigSameUserDifferentBool.features.feature5.variationKey,
        )
        expect(
            bucketedConfigSameUserDifferentBool.features.feature5.variationKey,
        ).toEqual(
            bucketedConfigDifferentUserSameBool.features.feature5.variationKey,
        )
    })

    it('errors when feature missing distribution', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            email: 'test@email.com',
        }
        expect(() =>
            generateBucketedConfig({ config: barrenConfig, user }),
        ).toThrow('Failed to decide target variation')
    })

    it('errors when config missing variations', () => {
        const user = {
            country: 'US',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza',
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com',
        }
        expect(() =>
            generateBucketedConfig({ config: barrenConfig, user }),
        ).toThrow('Config missing variation: 615382338424cb11646d7667')
    })

    it('errors when config missing variables', () => {
        const user = {
            country: 'CA',
            user_id: 'asuh',
            email: 'test@notemail.com',
            platform: 'Android',
        }
        expect(() =>
            generateBucketedConfig({ config: barrenConfig, user }),
        ).toThrow('Config missing variable: 61538237b0a70b58ae6af71g')
    })

    it('puts the user in the target (customData !exists) with null Custom Data', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@email.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature5: {
                    _id: '614ef6aa475928459060721d',
                    _variation: '615382338424cb11646d7662',
                    key: 'feature5',
                    type: 'ops',
                    variationKey: 'audience-match-variation',
                    variationName: 'audience match variation',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Custom Data -> favouriteNull',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721d': '615382338424cb11646d7662',
            },
            variableVariationMap: {},
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    _feature: '614ef6aa475928459060721d',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Custom Data -> favouriteNull',
                        target_id: '61536f468fd67f0091982533',
                    },
                },
            },
        }

        // Targeting Rule expects the Custom Data property of "favouriteNull" to exist
        // However, since the User has a null value for this property,
        // the Variable for User method should not return any variables
        const c = generateBucketedConfig({
            config: configWithNullCustomData,
            user,
        })
        expect(c).toEqual(expected)
    })

    it('puts the user in the target (customData exists) for the first audience they match', () => {
        const user = {
            country: 'US',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: 'null',
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true,
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@email.com',
        }
        const expected = {
            environment: {
                _id: '6153553b8cf4e45e0464268d',
                key: 'test-environment',
            },
            project: expect.objectContaining({
                _id: '61535533396f00bab586cb17',
                a0_organization: 'org_12345612345',
                key: 'test-project',
            }),
            features: {
                feature4: {
                    _id: '614ef6aa475928459060721d',
                    _variation: '615382338424cb11646d7662',
                    key: 'feature4',
                    type: 'permission',
                    variationKey: 'audience-match-variation',
                    variationName: 'audience match variation',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Custom Data -> favouriteNull',
                        target_id: '61536f468fd67f0091982532',
                    },
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721d': '615382338424cb11646d7662',
            },
            variableVariationMap: {},
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    _feature: '614ef6aa475928459060721d',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: 'Custom Data -> favouriteNull',
                        target_id: '61536f468fd67f0091982532',
                    },
                },
            },
        }

        // Targeting Rule expects the Custom Data property of "favouriteNull" to exist
        // However, since the User has a null value for this property,
        // the Variable for User method should not return any variables
        const c = generateBucketedConfig({
            config: configWithNullCustomData,
            user,
        })
        expect(c).toEqual(expected)
    })

    describe('Audience OR definitions', () => {
        it('should handle top level or', () => {
            const userMatchesEmailAndAppVersion = {
                user_id: 'Z',
                appVersion: '1.0.0',
                email: 'email@email.com',
                customData: {
                    favouriteFood: 'coffee',
                },
            }

            const c = generateBucketedConfig({
                config: configWithTopLevelOrAudience,
                user: userMatchesEmailAndAppVersion,
            })
            expect(c.features['top_level_or_feature']).toBeDefined()
            expect(c.features['top_level_or_feature'].variationKey).toBe(
                'audience-match-variation',
            )
            expect(c.variables['audience-match']).toBeDefined()
            expect(c.variables['audience-match'].value).toBe('audience_match')

            const userNoMatch = {
                user_id: 'Z',
                appVersion: '0.0.0',
                email: 'email@nomatch.com',
                customData: {
                    favouriteFood: 'coffee',
                },
            }

            const noMatchConfig = generateBucketedConfig({
                config: configWithTopLevelOrAudience,
                user: userNoMatch,
            })
            expect(
                noMatchConfig.features['top_level_or_feature'],
            ).toBeUndefined()
            expect(noMatchConfig.variables['audience-match']).toBeUndefined()
        })

        it('should handle nested or', () => {
            const userMatchesFavouriteFood = {
                user_id: 'Z',
                customData: {
                    favouriteFood: 'pizza',
                },
            }

            const bucketedConfig = generateBucketedConfig({
                config: configWithNestedOrAudience,
                user: userMatchesFavouriteFood,
            })
            expect(bucketedConfig.features['nested_or_feature']).toBeDefined()
            expect(
                bucketedConfig.features['nested_or_feature'].variationKey,
            ).toBe('audience-match-variation')
            expect(bucketedConfig.variables['audience-match']).toBeDefined()
            expect(bucketedConfig.variables['audience-match'].value).toBe(
                'audience_match',
            )

            const userNoMatch = {
                user_id: 'Z',
            }

            const noMatchConfig = generateBucketedConfig({
                config: configWithNestedOrAudience,
                user: userNoMatch,
            })
            expect(noMatchConfig.features['nested_or_feature']).toBeUndefined()
            expect(noMatchConfig.variables['audience-match']).toBeUndefined()
        })
    })
})

describe('Bounded Hash Limits', () => {
    const testCases = [
        {
            name: 'Random Distribution',
            expectedVariation: '', // Don't test specific variation for random distribution
            target: {
                _id: 'target',
                _audience: {
                    _id: 'id',
                    filters: {
                        operator: AudienceOperator.and,
                        filters: [{ type: FilterType.all }],
                    },
                },
                distribution: [
                    {
                        _variation: 'var1',
                        percentage: 0.2555,
                    },
                    {
                        _variation: 'var2',
                        percentage: 0.4445,
                    },
                    {
                        _variation: 'var3',
                        percentage: 0.1,
                    },
                    {
                        _variation: 'var4',
                        percentage: 0.2,
                    },
                ],
                bucketingKey: 'user_id',
            },
        },
        {
            name: 'Random Distribution & Rollout',
            expectedVariation: '', // Don't test specific variation for random distribution
            target: {
                _id: 'target',
                _audience: {
                    _id: 'id',
                    filters: {
                        operator: AudienceOperator.and,
                        filters: [{ type: FilterType.all }],
                    },
                },
                distribution: [
                    {
                        _variation: 'var5',
                        percentage: 0.6667,
                    },
                    {
                        _variation: 'var6',
                        percentage: 0.3333,
                    },
                ],
                bucketingKey: 'user_id',
                rollout: {
                    startDate: new Date(moment().subtract(1, 'days').toDate()),
                    startPercentage: 0,
                    type: 'schedule',
                } as Rollout,
            },
        },
        {
            name: 'Single Distribution',
            expectedVariation: 'var7',
            target: {
                _id: 'target',
                _audience: {
                    _id: 'id',
                    filters: {
                        operator: AudienceOperator.and,
                        filters: [{ type: FilterType.all }],
                    },
                },
                distribution: [
                    {
                        _variation: 'var7',
                        percentage: 1,
                    },
                ],
                bucketingKey: 'user_id',
            },
        },
    ]

    testCases.forEach((tc) => {
        describe(tc.name, () => {
            it('should handle bounded hash value 0.2555', () => {
                const variation = decideTargetVariation({
                    target: tc.target,
                    boundedHash: 0.2555,
                    reasonDetails: 'All Users',
                })
                expect(variation).toBeDefined()
                if (tc.expectedVariation) {
                    expect(variation.variation).toBe(tc.expectedVariation)
                    expect(variation.eval?.reason).toBe(
                        EVAL_REASONS.TARGETING_MATCH,
                    )
                    expect(variation.eval?.details).toBe('All Users')
                } else if (tc.target.rollout) {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | Rollout | All Users',
                    )
                } else {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | All Users',
                    )
                }
            })

            it('should handle edge case: bounded hash value 0', () => {
                const variation = decideTargetVariation({
                    target: tc.target,
                    boundedHash: 0,
                    reasonDetails: 'All Users',
                })
                expect(variation).toBeDefined()
                if (tc.expectedVariation) {
                    expect(variation.variation).toBe(tc.expectedVariation)
                    expect(variation.eval?.reason).toBe(
                        EVAL_REASONS.TARGETING_MATCH,
                    )
                    expect(variation.eval?.details).toBe('All Users')
                } else if (tc.target.rollout) {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | Rollout | All Users',
                    )
                } else {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | All Users',
                    )
                }
            })

            it('should handle edge case: bounded hash value 1', () => {
                const variation = decideTargetVariation({
                    target: tc.target,
                    boundedHash: 1,
                    reasonDetails: 'All Users',
                })
                expect(variation).toBeDefined()
                if (tc.expectedVariation) {
                    expect(variation.variation).toBe(tc.expectedVariation)
                    expect(variation.eval?.reason).toBe(
                        EVAL_REASONS.TARGETING_MATCH,
                    )
                    expect(variation.eval?.details).toBe('All Users')
                } else if (tc.target.rollout) {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | Rollout | All Users',
                    )
                } else {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | All Users',
                    )
                }
            })

            it('should handle edge case: bounded hash value just under 1', () => {
                const variation = decideTargetVariation({
                    target: tc.target,
                    boundedHash: 0.9999999,
                    reasonDetails: 'All Users',
                })
                expect(variation).toBeDefined()
                if (tc.expectedVariation) {
                    expect(variation.variation).toBe(tc.expectedVariation)
                    expect(variation.eval?.reason).toBe(
                        EVAL_REASONS.TARGETING_MATCH,
                    )
                    expect(variation.eval?.details).toBe('All Users')
                } else if (tc.target.rollout) {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | Rollout | All Users',
                    )
                } else {
                    expect(variation.eval?.reason).toBe(EVAL_REASONS.SPLIT)
                    expect(variation.eval?.details).toBe(
                        'Random Distribution | All Users',
                    )
                }
            })
        })
    })
})
describe('Rollout Logic', () => {
    describe('gradual', () => {
        it('it should evaluate correctly given various hashes', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(1, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [
                    {
                        percentage: 1,
                        date: moment().add(1, 'days').toDate(),
                        type: 'linear',
                    },
                ],
            }
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.35 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.85 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.2 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.75 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.85 }),
            ).toBeFalsy()
            rollout.stages![0].percentage = 0.8
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.51 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.95 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.35 }),
            ).toBeTruthy()
        })

        it('should not pass rollout for startDates in the future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [
                    {
                        percentage: 1,
                        type: 'linear',
                        date: moment().add(2, 'days').toDate(),
                    },
                ],
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.5 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.75 }),
            ).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 1 })).toBeFalsy()
        })
        it('should pass rollout for endDates in the past', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(2, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [
                    {
                        type: 'linear',
                        percentage: 1,
                        date: moment().subtract(1, 'days').toDate(),
                    },
                ],
            }
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.5 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.75 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 1 }),
            ).toBeTruthy()
        })

        it('returns start value when end date not set', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(30, 'seconds').toDate(),
                startPercentage: 1,
                type: 'gradual',
            }
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.4 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.6 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.9 }),
            ).toBeTruthy()
        })

        it('returns 0 when end date not set and start in future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'minute').toDate(),
                startPercentage: 1,
                type: 'gradual',
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.4 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.6 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.9 }),
            ).toBeFalsy()
        })
    })

    describe('schedule', () => {
        it('lets user through when schedule has passed', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(1, 'minute').toDate(),
                type: 'schedule',
            }
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.4 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.6 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.9 }),
            ).toBeTruthy()
        })

        it('blocks user when schedule is in the future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'minute').toDate(),
                type: 'schedule',
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.4 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.6 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.9 }),
            ).toBeFalsy()
        })
    })

    describe('stepped', () => {
        it('uses the exact percentage of the correct step in the rollout', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(3, 'days').toDate(),
                startPercentage: 0,
                type: 'stepped',
                stages: [
                    {
                        type: 'discrete',
                        percentage: 0.25,
                        date: moment().subtract(2, 'days').toDate(),
                    },
                    {
                        type: 'discrete',
                        percentage: 0.5,
                        date: moment().subtract(1, 'days').toDate(),
                    },
                    {
                        type: 'discrete',
                        percentage: 0.75,
                        date: moment().add(1, 'days').toDate(),
                    },
                ],
            }

            expect(
                doesUserPassRollout({ rollout, boundedHash: 0 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.25 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.4 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.6 }),
            ).toBeFalsy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.9 }),
            ).toBeFalsy()
        })

        it('should handle stepped rollout with 0% start and 100% later stage', () => {
            const rollout: PublicRollout = {
                type: 'stepped',
                startDate: new Date(
                    new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
                ),
                startPercentage: 0,
                stages: [
                    {
                        type: 'discrete',
                        date: new Date(
                            new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
                        ),
                        percentage: 1,
                    },
                ],
            }

            // Before next stage - should be 0%
            jest.useFakeTimers().setSystemTime(new Date())
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeFalsy()
            }

            // After 100% stage - should pass all users
            jest.useFakeTimers().setSystemTime(
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
            )
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeTruthy()
            }

            jest.useRealTimers()
        })

        it('should handle stepped rollout with 50% start and 100% later stage', () => {
            const rollout: PublicRollout = {
                type: 'stepped',
                startDate: new Date(
                    new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
                ),
                startPercentage: 0.5,
                stages: [
                    {
                        type: 'discrete',
                        date: new Date(
                            new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
                        ),
                        percentage: 1,
                    },
                ],
            }

            // Before next stage - should be 50%
            jest.useFakeTimers().setSystemTime(new Date())
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.49 }),
            ).toBeTruthy()
            expect(
                doesUserPassRollout({ rollout, boundedHash: 0.51 }),
            ).toBeFalsy()

            // After 100% stage - should pass all users
            jest.useFakeTimers().setSystemTime(
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
            )
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeTruthy()
            }

            jest.useRealTimers()
        })

        it('should handle stepped rollout with 100% start and 0% later stage', () => {
            const rollout: PublicRollout = {
                type: 'stepped',
                startDate: new Date(
                    new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
                ),
                startPercentage: 1,
                stages: [
                    {
                        type: 'discrete',
                        date: new Date(
                            new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
                        ),
                        percentage: 0,
                    },
                ],
            }

            // Before next stage - should be 100%
            jest.useFakeTimers().setSystemTime(new Date())
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeTruthy()
            }

            // After 0% stage - should fail all users
            jest.useFakeTimers().setSystemTime(
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
            )
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeFalsy()
            }

            jest.useRealTimers()
        })

        it('should handle stepped rollout with a future start date', () => {
            const rollout: PublicRollout = {
                type: 'stepped',
                startDate: new Date(
                    new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
                ),
                startPercentage: 1,
                stages: [
                    {
                        type: 'discrete',
                        date: new Date(
                            new Date().getTime() + 1000 * 60 * 60 * 24 * 14,
                        ),
                        percentage: 0,
                    },
                ],
            }

            // Before next stage - should be no one
            jest.useFakeTimers().setSystemTime(new Date())
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeFalsy()
            }

            // After start date - should pass all users
            jest.useFakeTimers().setSystemTime(
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
            )
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeTruthy()
            }

            // After next stage - should be no one
            jest.useFakeTimers().setSystemTime(
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 15),
            )
            for (let i = 0; i < 100; i++) {
                expect(
                    doesUserPassRollout({ rollout, boundedHash: i / 100 }),
                ).toBeFalsy()
            }

            jest.useRealTimers()
        })
    })

    it('throws when given an empty rollout object', () => {
        const rollout = {} as Rollout
        expect(() => doesUserPassRollout({ rollout, boundedHash: 0 })).toThrow()
    })

    it('lets user through with undefined', () => {
        expect(doesUserPassRollout({ boundedHash: 0 })).toBeTruthy()
        expect(doesUserPassRollout({ boundedHash: 0.25 })).toBeTruthy()
        expect(doesUserPassRollout({ boundedHash: 0.4 })).toBeTruthy()
        expect(doesUserPassRollout({ boundedHash: 0.6 })).toBeTruthy()
        expect(doesUserPassRollout({ boundedHash: 0.9 })).toBeTruthy()
    })

    describe('overrides', () => {
        it('correctly overrides a bucketing decision and a feature that doesnt normally pass segmentation', () => {
            const user = {
                country: 'CA',
                user_id: 'asuh',
                email: 'test',
                platform: 'android',
            }
            const overrides = {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
                // should ignore this one
                asdasdasdas: 'asdasdsaasddas',
            }
            const expected = {
                environment: {
                    _id: '6153553b8cf4e45e0464268d',
                    key: 'test-environment',
                },
                project: expect.objectContaining({
                    _id: '61535533396f00bab586cb17',
                    a0_organization: 'org_12345612345',
                    key: 'test-project',
                }),
                features: {
                    feature1: {
                        _id: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                        key: 'feature1',
                        type: 'release',
                        variationKey: 'variation-1-key',
                        variationName: 'variation 1',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    feature2: {
                        _id: '614ef6aa475928459060721a',
                        _variation: '615382338424cb11646d7667',
                        key: 'feature2',
                        type: 'release',
                        variationKey: 'variation-1-aud-2-key',
                        variationName: 'variation 1 aud 2',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                },
                featureVariationMap: {
                    '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                    '614ef6aa475928459060721a': '615382338424cb11646d7667',
                },
                variableVariationMap: {},
                variables: {
                    swagTest: {
                        _id: '615356f120ed334a6054564c',
                        _feature: '614ef6aa473928459060721a',
                        key: 'swagTest',
                        type: 'String',
                        value: 'man',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    'bool-var': {
                        _id: '61538237b0a70b58ae6af71y',
                        _feature: '614ef6aa473928459060721a',
                        key: 'bool-var',
                        type: 'Boolean',
                        value: false,
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    feature2Var: {
                        _id: '61538237b0a70b58ae6af71f',
                        _feature: '614ef6aa475928459060721a',
                        key: 'feature2Var',
                        type: 'String',
                        value: 'Var 1 aud 2',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    'json-var': {
                        _id: '61538237b0a70b58ae6af71q',
                        _feature: '614ef6aa473928459060721a',
                        key: 'json-var',
                        type: 'JSON',
                        value: '{"hello":"world","num":610,"bool":true}',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    'num-var': {
                        _id: '61538237b0a70b58ae6af71s',
                        _feature: '614ef6aa473928459060721a',
                        key: 'num-var',
                        type: 'Number',
                        value: 610.61,
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                    test: {
                        _id: '614ef6ea475129459160721a',
                        _feature: '614ef6aa473928459060721a',
                        key: 'test',
                        type: 'String',
                        value: 'scat',
                        eval: {
                            reason: EVAL_REASONS.OVERRIDE,
                            details: 'Override',
                        },
                    },
                },
            }
            const c = generateBucketedConfig({ config, user, overrides })
            expect(c).toEqual(expected)
        })
    })
})
