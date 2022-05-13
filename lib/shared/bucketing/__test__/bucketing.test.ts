/* eslint-disable max-len */

import { Audience, FeatureType, Rollout } from '@devcycle/types'
import {
    generateBoundedHashes,
    decideTargetVariation,
    generateBucketedConfig,
    doesUserPassRollout
} from '../src/bucketing'
import { config, barrenConfig } from '@devcycle/bucketing-test-data/src/data/testData'

import moment from 'moment'
import * as _ from 'lodash'
import * as uuid from 'uuid'

describe('User Hashing and Bucketing', () => {
    it('generates buckets approximately in the same distribution as the variation distributions', () => {
        const buckets: string[] = []
        const testTarget = {
            _audience: { _id: 'id', filters: [] } as unknown as Audience,
            _id: 'target',
            distribution: [
                { _variation: 'var1', percentage: 0.25 },
                { _variation: 'var2', percentage: 0.45 },
                { _variation: 'var4', percentage: 0.2 },
                { _variation: 'var3', percentage: 0.1 }
            ]
        }
        _.times(30000, () => {
            const user_id = uuid.v4()
            const { bucketingHash } = generateBoundedHashes(user_id, testTarget._id)
            buckets.push(decideTargetVariation({ target: testTarget, boundedHash: bucketingHash }))
        })

        const var1 = _.filter(buckets, (bucket) => bucket === 'var1')
        const var2 = _.filter(buckets, (bucket) => bucket === 'var2')
        const var3 = _.filter(buckets, (bucket) => bucket === 'var3')
        const var4 = _.filter(buckets, (bucket) => bucket === 'var4')

        expect(var1.length / buckets.length).toBeGreaterThan(0.24)
        expect(var1.length / buckets.length).toBeLessThan(0.26)
        expect(var2.length / buckets.length).toBeGreaterThan(0.44)
        expect(var2.length / buckets.length).toBeLessThan(0.46)
        expect(var4.length / buckets.length).toBeGreaterThan(0.19)
        expect(var4.length / buckets.length).toBeLessThan(0.21)
        expect(var3.length / buckets.length).toBeGreaterThan(0.09)
        expect(var3.length / buckets.length).toBeLessThan(0.11)
    })

    it('that bucketing hash yields the same hash for user_id', () => {
        const user_id = uuid.v4()
        const { bucketingHash } = generateBoundedHashes(user_id, 'fake')
        const { bucketingHash: bucketingHash2 } = generateBoundedHashes(user_id, 'fake')
        expect(bucketingHash).toBe(bucketingHash2)
    })

    it('generates different hashes for different target_id seeds', () => {
        const user_id = uuid.v4()
        const { bucketingHash } = generateBoundedHashes(user_id, 'fake')
        const { bucketingHash: bucketingHash2 } = generateBoundedHashes(user_id, 'fake2')
        expect(bucketingHash).not.toBe(bucketingHash2)
    })

    it('should generate rollout hash deterministically', () => {
        const user_id = uuid.v4()
        const { rolloutHash } = generateBoundedHashes(user_id, 'fake')
        const { rolloutHash: rolloutHash2 } = generateBoundedHashes(user_id, 'fake')
        expect(rolloutHash).toBe(rolloutHash2)
    })

    it('generates different hashes for different rollout and bucketing', () => {
        const user_id = uuid.v4()
        const { rolloutHash, bucketingHash } = generateBoundedHashes(user_id, 'fake')
        expect(bucketingHash).not.toBe(rolloutHash)
    })
})

describe('Config Parsing and Generating', () => {
    it('generates the correctly modified config from the example config', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test'
        }
        const expected = {
            'environment': {
                '_id': '6153553b8cf4e45e0464268d',
                'key': 'test-environment'
            },
            'knownVariableKeys': [
                3126796075,
                1879689550,
                2621975932,
                4138596111
            ],
            'project': {
                '_id': '61535533396f00bab586cb17',
                'a0_organization': 'org_12345612345',
                'key': 'test-project'
            },
            'features': {
                'feature1': {
                    '_id': '614ef6aa473928459060721a',
                    'key': 'feature1',
                    'type': FeatureType.release,
                    '_variation': '615357cf7e9ebdca58446ed0'
                }
            },
            'featureVariationMap': {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0'
            },
            'variables': {
                'swagTest': {
                    '_id': '615356f120ed334a6054564c',
                    'key': 'swagTest',
                    'type': 'String',
                    'value': 'YEEEEOWZA'
                }
            }
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('puts the user in the target for the first audience they match', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza'
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@email.com'
        }
        const expected = {
            'environment': {
                '_id': '6153553b8cf4e45e0464268d',
                'key': 'test-environment'
            },
            'knownVariableKeys': [
                1879689550
            ],
            'project': {
                '_id': '61535533396f00bab586cb17',
                'a0_organization': 'org_12345612345',
                'key': 'test-project'
            },
            'features': {
                'feature1': {
                    '_id': '614ef6aa473928459060721a',
                    'key': 'feature1',
                    'type': FeatureType.release,
                    '_variation': '6153553b8cf4e45e0464268d'
                },
                'feature2': {
                    '_id': '614ef6aa475928459060721a',
                    'key': 'feature2',
                    'type': FeatureType.release,
                    '_variation': '615382338424cb11646d7668'
                }
            },
            'featureVariationMap': {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7668'
            },
            'variables': {
                'feature2.cool': {
                    '_id': '61538237b0a70b58ae6af71g',
                    'key': 'feature2.cool',
                    'type': 'String',
                    'value': 'multivar first'
                },
                'feature2.hello': {
                    '_id': '61538237b0a70b58ae6af71h',
                    'key': 'feature2.hello',
                    'type': 'String',
                    'value': 'multivar last'
                },
                'swagTest': {
                    '_id': '615356f120ed334a6054564c',
                    'key': 'swagTest',
                    'type': 'String',
                    'value': 'man'
                },
                'test': {
                    '_id': '614ef6ea475129459160721a',
                    'key': 'test',
                    'type': 'String',
                    'value': 'scat'
                }
            }
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('holds user back if not in rollout', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'asuh',
            customData: {
                favouriteFood: 'pizza'
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com'
        }
        const expected = {
            'environment': {
                '_id': '6153553b8cf4e45e0464268d',
                'key': 'test-environment'
            },
            'knownVariableKeys': [
                3126796075,
                2547774734,
                2621975932,
                4138596111
            ],
            'project': {
                '_id': '61535533396f00bab586cb17',
                'a0_organization': 'org_12345612345',
                'key': 'test-project'
            },
            'features': {
                'feature2': {
                    '_id': '614ef6aa475928459060721a',
                    'key': 'feature2',
                    'type': FeatureType.release,
                    '_variation': '615382338424cb11646d7667'
                }
            },
            'featureVariationMap': {
                '614ef6aa475928459060721a': '615382338424cb11646d7667'
            },
            'variables': {
                'feature2Var': {
                    '_id': '61538237b0a70b58ae6af71f',
                    'key': 'feature2Var',
                    'type': 'String',
                    'value': 'Var 1 aud 2'
                }
            }
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('puts user through if in rollout', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza'
            },
            privateCustomData: {
                favouriteDrink: 'coffee'
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com'
        }
        const expected = {
            'environment': {
                '_id': '6153553b8cf4e45e0464268d',
                'key': 'test-environment'
            },
            'knownVariableKeys': [
                3126796075,
                2621975932,
                4138596111
            ],
            'project': {
                '_id': '61535533396f00bab586cb17',
                'a0_organization': 'org_12345612345',
                'key': 'test-project'
            },
            'features': {
                'feature1': {
                    '_id': '614ef6aa473928459060721a',
                    'key': 'feature1',
                    'type': FeatureType.release,
                    '_variation': '615357cf7e9ebdca58446ed0'
                },
                'feature2': {
                    '_id': '614ef6aa475928459060721a',
                    'key': 'feature2',
                    'type': FeatureType.release,
                    '_variation': '615382338424cb11646d7667'
                }
            },
            'featureVariationMap': {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
                '614ef6aa475928459060721a': '615382338424cb11646d7667'
            },
            'variables': {
                'swagTest': {
                    '_id': '615356f120ed334a6054564c',
                    'key': 'swagTest',
                    'type': 'String',
                    'value': 'YEEEEOWZA'
                },
                'feature2Var': {
                    '_id': '61538237b0a70b58ae6af71f',
                    'key': 'feature2Var',
                    'type': 'String',
                    'value': 'Var 1 aud 2'
                }
            }
        }
        const c = generateBucketedConfig({ config, user })
        expect(c).toEqual(expected)
    })

    it('errors when feature missing distribution', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'asuh',
            email: 'test@email.com'
        }
        expect(() => generateBucketedConfig({ config: barrenConfig, user }))
            .toThrow('Failed to decide target variation')
    })

    it('errors when config missing variations', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza'
            },
            privateCustomData: {
                favouriteDrink: 'coffee',
                favouriteNumber: 610,
                favouriteBoolean: true
            },
            platformVersion: '1.1.2',
            os: 'Android',
            email: 'test@notemail.com'
        }
        expect(() => generateBucketedConfig({ config: barrenConfig, user }))
            .toThrow('Config missing variation: 615382338424cb11646d7667')
    })

    it('errors when config missing variables', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test@notemail.com'
        }
        expect(() => generateBucketedConfig({ config: barrenConfig, user }))
            .toThrow('Config missing variable: 61538237b0a70b58ae6af71g')
    })
})

describe('Rollout Logic', () => {
    describe('gradual', () => {
        it('it should evaluate correctly given various hashes', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(1, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [{
                    percentage: 1,
                    date: moment().add(1, 'days').toDate(),
                    type: 'linear'
                }]
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0.35 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.85 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.2 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.75 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.85 })).toBeFalsy()
            rollout.stages![0].percentage = 0.8
            expect(doesUserPassRollout({ rollout, boundedHash: 0.51 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.95 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.35 })).toBeTruthy()
        })

        it('should not pass rollout for startDates in the future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [{
                    percentage: 1,
                    type: 'linear',
                    date: moment().add(2, 'days').toDate()
                }]
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.5 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.75 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 1 })).toBeFalsy()
        })
        it('should pass rollout for endDates in the past', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(2, 'days').toDate(),
                startPercentage: 0,
                type: 'gradual',
                stages: [{
                    type: 'linear',
                    percentage: 1,
                    date: moment().subtract(1, 'days').toDate(),
                }]
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.5 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.75 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 1 })).toBeTruthy()
        })

        it('returns start value when end date not set', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(30, 'seconds').toDate(),
                startPercentage: 1,
                type: 'gradual'
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.4 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.6 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.9 })).toBeTruthy()
        })

        it('returns 0 when end date not set and start in future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'minute').toDate(),
                startPercentage: 1,
                type: 'gradual'
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.4 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.6 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.9 })).toBeFalsy()
        })
    })

    describe('schedule', () => {
        it('lets user through when schedule has passed', () => {
            const rollout: Rollout = {
                startDate: moment().subtract(1, 'minute').toDate(),
                type: 'schedule'
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.4 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.6 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.9 })).toBeTruthy()
        })

        it('blocks user when schedule is in the future', () => {
            const rollout: Rollout = {
                startDate: moment().add(1, 'minute').toDate(),
                type: 'schedule'
            }
            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.4 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.6 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.9 })).toBeFalsy()
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
                    }
                ]
            }

            expect(doesUserPassRollout({ rollout, boundedHash: 0 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.25 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.4 })).toBeTruthy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.6 })).toBeFalsy()
            expect(doesUserPassRollout({ rollout, boundedHash: 0.9 })).toBeFalsy()
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
})
