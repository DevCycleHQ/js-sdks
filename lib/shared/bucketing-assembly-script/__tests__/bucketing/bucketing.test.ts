import {
    generateBoundedHashesFromJSON,
    decideTargetVariationFromJSON,
    generateBucketedConfigForUser,
    generateBucketedConfigForUserWithOverrides,
    doesUserPassRolloutFromJSON,
    setPlatformData,
    setClientCustomData,
    variableForUser as variableForUser_AS,
    VariableType,
} from '../bucketingImportHelper'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config, barrenConfig, configWithNullCustomData } = testData

import moment from 'moment'
import * as uuid from 'uuid'
import { BucketedUserConfig, SDKVariable } from '@devcycle/types'
import { cleanupSDK, initSDK } from '../setPlatformData'
import {
    variableForUserPB,
    VariableForUserArgs,
} from '../protobufVariableHelper'

type BoundedHash = { rolloutHash: number; bucketingHash: number }

const defaultPlatformData = {
    platform: '',
    platformVersion: '1.1.2',
    sdkType: '',
    sdkVersion: '',
    deviceModel: '',
}
const sdkKey = 'sdkKey'

const setPlatformDataJSON = (data: unknown) => {
    setPlatformData(JSON.stringify(data))
}

setPlatformDataJSON(defaultPlatformData)

const setClientCustomDataJSON = (data: unknown) => {
    setClientCustomData(sdkKey, JSON.stringify(data))
}

const generateBoundedHashes = (
    user_id: string,
    target_id: string,
): BoundedHash => {
    const boundedHashes = generateBoundedHashesFromJSON(user_id, target_id)
    return JSON.parse(boundedHashes) as BoundedHash
}

const decideTargetVariation = ({
    target,
    boundedHash,
}: {
    target: unknown
    boundedHash: number
}): string => {
    return decideTargetVariationFromJSON(JSON.stringify(target), boundedHash)
}

const generateBucketedConfig = (user: unknown): BucketedUserConfig => {
    const bucketedConfig = generateBucketedConfigForUser(
        sdkKey,
        JSON.stringify(user),
    )
    return JSON.parse(bucketedConfig) as BucketedUserConfig
}

const testGenerateBucketingConfigWithOverrides = (
    user: unknown,
    overrides: unknown,
): BucketedUserConfig => {
    const userStr = JSON.stringify(user)
    const overridesStr = JSON.stringify(overrides)
    const userUtf8 = Buffer.from(userStr, 'utf8')
    const overridesUtf8 = Buffer.from(overridesStr, 'utf8')
    const result = generateBucketedConfigForUserWithOverrides(
        sdkKey,
        userUtf8,
        overridesUtf8,
    )
    const resultString = new TextDecoder().decode(result)
    return JSON.parse(resultString) as BucketedUserConfig
}

const expectVariableForUser = (
    args: { user: any; variableKey: string; variableType: VariableType },
    expectedValue: unknown,
) => {
    const variable = variableForUser({ ...args, sdkKey })
    const pbVariable = variableForUserPB({ ...args, sdkKey })

    if (expectedValue === null) {
        expect(variable).toBeNull()
        expect(pbVariable).toBeNull()
    } else {
        expect(variable).not.toBeNull()
        expect(variable).toEqual(expectedValue)
        expect(pbVariable).not.toBeNull()
        expect(pbVariable).toEqual(expectedValue)
    }
}

const variableForUser = ({
    user,
    variableKey,
    variableType,
}: VariableForUserArgs): SDKVariable | null => {
    const variableJSON = variableForUser_AS(
        sdkKey,
        JSON.stringify(user),
        variableKey,
        variableType,
        true,
    )
    return variableJSON ? (JSON.parse(variableJSON) as SDKVariable) : null
}

const doesUserPassRollout = ({
    rollout,
    boundedHash,
}: {
    rollout?: unknown
    boundedHash: number
}): boolean => {
    return doesUserPassRolloutFromJSON(
        rollout ? JSON.stringify(rollout) : null,
        boundedHash,
    )
}

describe('User Hashing and Bucketing', () => {
    it('generates buckets approximately in the same distribution as the variation distributions', () => {
        const buckets = {
            var1: 0,
            var2: 0,
            var3: 0,
            var4: 0,
            total: 0,
        }

        const testTarget = {
            _audience: { _id: 'id', filters: { filters: [], operator: 'and' } },
            _id: 'target',
            distribution: [
                { _variation: 'var1', percentage: 0.25 },
                { _variation: 'var2', percentage: 0.45 },
                { _variation: 'var4', percentage: 0.2 },
                { _variation: 'var3', percentage: 0.1 },
            ],
        }

        for (let i = 0; i < 30000; i++) {
            const user_id = uuid.v4()
            const { bucketingHash } = generateBoundedHashes(
                user_id,
                testTarget._id,
            )

            const variation = decideTargetVariation({
                target: testTarget,
                boundedHash: bucketingHash,
            }) as keyof typeof buckets
            buckets[variation]++
            buckets.total++
        }

        expect(buckets.var1 / buckets.total).toBeGreaterThan(0.24)
        expect(buckets.var1 / buckets.total).toBeLessThan(0.26)
        expect(buckets.var2 / buckets.total).toBeGreaterThan(0.44)
        expect(buckets.var2 / buckets.total).toBeLessThan(0.46)
        expect(buckets.var4 / buckets.total).toBeGreaterThan(0.19)
        expect(buckets.var4 / buckets.total).toBeLessThan(0.21)
        expect(buckets.var3 / buckets.total).toBeGreaterThan(0.09)
        expect(buckets.var3 / buckets.total).toBeLessThan(0.11)
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
    afterEach(() => cleanupSDK(sdkKey))

    it('generates the correctly modified config from the example config', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test',
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
                    type: 'release',
                    _variation: '615357cf7e9ebdca58446ed0',
                    variationName: 'variation 2',
                    variationKey: 'variation-2-key',
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
            },
            variableVariationMap: {
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                'bool-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                'json-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                'num-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
            },
            variables: {
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    key: 'swagTest',
                    type: 'String',
                    value: 'YEEEEOWZA',
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                },
            },
        }
        initSDK(sdkKey, config)
        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'swagTest',
                variableType: VariableType.String,
            },
            expected.variables.swagTest,
        )
    })

    it('puts the user in the target for the first audience they match', () => {
        const user = {
            country: 'U S AND A',
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
                feature1: {
                    _id: '614ef6aa473928459060721a',
                    key: 'feature1',
                    type: 'release',
                    _variation: '6153553b8cf4e45e0464268d',
                    variationName: 'variation 1',
                    variationKey: 'variation-1-key',
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: 'release',
                    _variation: '615382338424cb11646d7668',
                    variationName: 'feature 2 variation',
                    variationKey: 'variation-feature-2-key',
                },
                feature3: {
                    _id: '614ef6aa475928459060721c',
                    _variation: '615382338424cb11646d7662',
                    key: 'feature3',
                    type: 'release',
                    variationKey: 'audience-match-variation',
                    variationName: 'audience match variation',
                },
                feature4: {
                    _id: '614ef8aa475928459060721c',
                    _variation: '615382338424cb11646d9668',
                    key: 'feature4',
                    settings: undefined,
                    type: 'release',
                    variationKey: 'variation-feature-2-key',
                    variationName: 'feature 4 variation',
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7668',
                '614ef6aa475928459060721c': '615382338424cb11646d7662',
                '614ef8aa475928459060721c': '615382338424cb11646d9668',
            },
            variableVariationMap: {
                'audience-match': {
                    _feature: '614ef6aa475928459060721c',
                    _variation: '615382338424cb11646d7662',
                },
                'feature2.cool': {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7668',
                },
                'feature2.hello': {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7668',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                'bool-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                'json-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                'num-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                feature4Var: {
                    _feature: '614ef8aa475928459060721c',
                    _variation: '615382338424cb11646d9668',
                },
            },
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                },
                'feature2.cool': {
                    _id: '61538237b0a70b58ae6af71g',
                    key: 'feature2.cool',
                    type: 'String',
                    value: 'multivar first',
                },
                'feature2.hello': {
                    _id: '61538237b0a70b58ae6af71h',
                    key: 'feature2.hello',
                    type: 'String',
                    value: 'multivar last',
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                },
                feature4Var: {
                    _id: '61538937b0a70b58ae6af71f',
                    key: 'feature4Var',
                    type: 'String',
                    value: 'feature 4 value',
                },
            },
        }
        initSDK(sdkKey, config)
        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'audience-match',
                variableType: VariableType.String,
            },
            expected.variables['audience-match'],
        )
        expectVariableForUser(
            {
                user,
                variableKey: 'feature2.cool',
                variableType: VariableType.String,
            },
            expected.variables['feature2.cool'],
        )
        expectVariableForUser(
            {
                user,
                variableKey: 'feature2.hello',
                variableType: VariableType.String,
            },
            expected.variables['feature2.hello'],
        )
        expectVariableForUser(
            {
                user,
                variableKey: 'swagTest',
                variableType: VariableType.String,
            },
            expected.variables['swagTest'],
        )
        expectVariableForUser(
            { user, variableKey: 'test', variableType: VariableType.String },
            expected.variables['test'],
        )
    })

    it('holds user back if not in rollout and passthrough disabled', () => {
        const user = {
            country: 'U S AND A',
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
            email: 'test@notemail.com',
        }
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
                    type: 'release',
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                },
            },
            variableVariationMap: {
                feature2Var: {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7667',
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                },
            },
        }
        initSDK(sdkKey, newConfig)

        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            expected.variables['feature2Var'],
        )
    })

    it('pushes user to next target if not in rollout and passthrough not disabled', () => {
        const user = {
            country: 'U S AND A',
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
                    type: 'release',
                    variationKey: 'variation-1-key',
                    variationName: 'variation 1',
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: 'release',
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                },
            },
            variableVariationMap: {
                'bool-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                feature2Var: {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7667',
                },
                'json-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                'num-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                },
            },
        }
        initSDK(sdkKey, config)

        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            expected.variables['feature2Var'],
        )
    })

    it('pushes user to next target if not in rollout and passthrough setting not defined', () => {
        const user = {
            country: 'U S AND A',
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
                    type: 'release',
                    variationKey: 'variation-1-key',
                    variationName: 'variation 1',
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: 'release',
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                },
            },
            variableVariationMap: {
                'bool-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                feature2Var: {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7667',
                },
                'json-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                'num-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variables: {
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                },
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    key: 'swagTest',
                    type: 'String',
                    value: 'man',
                },
                test: {
                    _id: '614ef6ea475129459160721a',
                    key: 'test',
                    type: 'String',
                    value: 'scat',
                },
            },
        }
        initSDK(sdkKey, newConfig)

        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            expected.variables['feature2Var'],
        )
    })

    it('puts user through if in rollout', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'pass_rollout',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
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
                    type: 'release',
                    _variation: '615357cf7e9ebdca58446ed0',
                    variationName: 'variation 2',
                    variationKey: 'variation-2-key',
                },
                feature2: {
                    _id: '614ef6aa475928459060721a',
                    key: 'feature2',
                    type: 'release',
                    _variation: '615382338424cb11646d7667',
                    variationName: 'variation 1 aud 2',
                    variationKey: 'variation-1-aud-2-key',
                },
            },
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
            variableVariationMap: {
                'bool-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                feature2Var: {
                    _feature: '614ef6aa475928459060721a',
                    _variation: '615382338424cb11646d7667',
                },
                'json-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                'num-var': {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '615357cf7e9ebdca58446ed0',
                },
            },
            variables: {
                'bool-var': {
                    _id: '61538237b0a70b58ae6af71y',
                    key: 'bool-var',
                    type: 'Boolean',
                    value: false,
                },
                swagTest: {
                    _id: '615356f120ed334a6054564c',
                    key: 'swagTest',
                    type: 'String',
                    value: 'YEEEEOWZA',
                },
                feature2Var: {
                    _id: '61538237b0a70b58ae6af71f',
                    key: 'feature2Var',
                    type: 'String',
                    value: 'Var 1 aud 2',
                },
                'json-var': {
                    _id: '61538237b0a70b58ae6af71q',
                    key: 'json-var',
                    type: 'JSON',
                    value: '{"hello":"world","num":610,"bool":true}',
                },
                'num-var': {
                    _id: '61538237b0a70b58ae6af71s',
                    key: 'num-var',
                    type: 'Number',
                    value: 610.61,
                },
            },
        }
        initSDK(sdkKey, config)
        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        expectVariableForUser(
            {
                user,
                variableKey: 'swagTest',
                variableType: VariableType.String,
            },
            expected.variables['swagTest'],
        )
        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            expected.variables['feature2Var'],
        )
    })

    it('errors when feature missing distribution', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'asuh',
            email: 'test@email.com',
        }
        initSDK(sdkKey, barrenConfig)
        expect(() => generateBucketedConfig(user)).toThrow(
            'Failed to decide target variation: 61536f3bc838a705c105eb62',
        )

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            null,
        )
    })

    it('errors when config missing variations', () => {
        const user = {
            country: 'U S AND A',
            user_id: 'pass_rollout',
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
            email: 'test@notemail.com',
        }
        initSDK(sdkKey, barrenConfig)
        expect(() => generateBucketedConfig(user)).toThrow(
            'Config missing variation: 615382338424cb11646d7667',
        )

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2Var',
                variableType: VariableType.String,
            },
            null,
        )
    })

    it('errors when config missing variables', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test@notemail.com',
        }
        initSDK(sdkKey, barrenConfig)
        expect(() => generateBucketedConfig(user)).toThrow(
            'Config missing variable: 61538237b0a70b58ae6af71g',
        )

        expectVariableForUser(
            {
                user,
                variableKey: 'feature2.cool',
                variableType: VariableType.String,
            },
            null,
        )
    })

    it('puts the user in the target (customData !exists) with null Custom Data', () => {
        const user = {
            country: 'U S AND A',
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
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721d': '615382338424cb11646d7662',
            },
            variableVariationMap: {
                'audience-match': {
                    _feature: '614ef6aa475928459060721d',
                    _variation: '615382338424cb11646d7662',
                },
            },
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                },
            },
        }
        initSDK(sdkKey, configWithNullCustomData)
        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        // Targeting Rule expects the Custom Data property of "favouriteNull" to exist
        // However, since the User has a null value for this property,
        // the Variable for User method should not return any variables
        expectVariableForUser(
            {
                user,
                variableKey: 'audience-match',
                variableType: VariableType.String,
            },
            null,
        )
    })

    it('puts the user in the target (customData exists) for the first audience they match', () => {
        const user = {
            country: 'U S AND A',
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
                },
            },
            featureVariationMap: {
                '614ef6aa475928459060721d': '615382338424cb11646d7662',
            },
            variableVariationMap: {
                'audience-match': {
                    _feature: '614ef6aa475928459060721d',
                    _variation: '615382338424cb11646d7662',
                },
            },
            variables: {
                'audience-match': {
                    _id: '61538237b0a70b58ae6af71z',
                    key: 'audience-match',
                    type: 'String',
                    value: 'audience_match',
                },
            },
        }
        initSDK(sdkKey, configWithNullCustomData)
        const c = generateBucketedConfig(user)
        expect(c).toEqual(expected)

        // Targeting Rule expects the Custom Data property of "favouriteNull" to exist
        // However, since the User has a null value for this property,
        // the Variable for User method should not return any variables
        expectVariableForUser(
            {
                user,
                variableKey: 'audience-match',
                variableType: VariableType.String,
            },
            expected.variables['audience-match'],
        )
    })

    describe('overrides', () => {
        it('overrides a bucketing decision as well as a feature that did not pass segmentation', () => {
            const user = {
                country: 'canada',
                user_id: 'asuh',
                email: 'test',
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
                        key: 'feature1',
                        type: 'release',
                        _variation: '6153553b8cf4e45e0464268d',
                        variationName: 'variation 1',
                        variationKey: 'variation-1-key',
                    },
                    feature2: {
                        _id: '614ef6aa475928459060721a',
                        key: 'feature2',
                        type: 'release',
                        _variation: '615382338424cb11646d7667',
                        variationKey: 'variation-1-aud-2-key',
                        variationName: 'variation 1 aud 2',
                    },
                },
                featureVariationMap: {
                    '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                    '614ef6aa475928459060721a': '615382338424cb11646d7667',
                },
                variableVariationMap: {
                    swagTest: {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                    'bool-var': {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                    feature2Var: {
                        _feature: '614ef6aa475928459060721a',
                        _variation: '615382338424cb11646d7667',
                    },
                    'json-var': {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                    'num-var': {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                    test: {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                },
                variables: {
                    swagTest: {
                        _id: '615356f120ed334a6054564c',
                        key: 'swagTest',
                        type: 'String',
                        value: 'man',
                    },
                    feature2Var: {
                        _id: '61538237b0a70b58ae6af71f',
                        key: 'feature2Var',
                        type: 'String',
                        value: 'Var 1 aud 2',
                    },
                    'bool-var': {
                        _id: '61538237b0a70b58ae6af71y',
                        key: 'bool-var',
                        type: 'Boolean',
                        value: false,
                    },
                    'json-var': {
                        _id: '61538237b0a70b58ae6af71q',
                        key: 'json-var',
                        type: 'JSON',
                        value: '{"hello":"world","num":610,"bool":true}',
                    },
                    'num-var': {
                        _id: '61538237b0a70b58ae6af71s',
                        key: 'num-var',
                        type: 'Number',
                        value: 610.61,
                    },
                    test: {
                        _id: '614ef6ea475129459160721a',
                        key: 'test',
                        type: 'String',
                        value: 'scat',
                    },
                },
            }
            initSDK(sdkKey, config)
            const c = testGenerateBucketingConfigWithOverrides(user, overrides)
            expect(c).toEqual(expected)
        })
    })
})

describe('Rollout Logic', () => {
    describe('gradual', () => {
        it('it should evaluate correctly given various hashes', () => {
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
            const rollout = {
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
    })

    it('throws when given an empty rollout object', () => {
        const rollout = {}
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

describe('Client Data', () => {
    afterEach(() => cleanupSDK(sdkKey))

    it('uses client data to allow a user into a feature', () => {
        const user = {
            user_id: 'client-test',
            customData: {
                favouriteFood: 'pizza',
                favouriteNull: null,
            },
            platformVersion: '1.1.2',
        }
        const clientData = {
            favouriteFood: 'NOT PIZZA!!',
            favouriteDrink: 'coffee',
        }

        initSDK(sdkKey, config)
        const c1 = generateBucketedConfig(user)
        expect(c1).toEqual(
            expect.objectContaining({
                featureVariationMap: {
                    '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                },
            }),
        )

        setClientCustomDataJSON(clientData)

        const expected = {
            featureVariationMap: {
                '614ef6aa473928459060721a': '615357cf7e9ebdca58446ed0',
                '614ef6aa475928459060721a': '615382338424cb11646d7667',
            },
        }
        const c2 = generateBucketedConfig(user)
        expect(c2).toEqual(expect.objectContaining(expected))

        setClientCustomDataJSON({
            favouriteFood: 'pizza',
            favouriteDrink: 'coffee',
        })

        const user2 = {
            user_id: 'hates-pizza',
            customData: {
                favouriteFood: 'NOT PIZZA!!',
            },
            platformVersion: '1.1.2',
        }

        const c3 = generateBucketedConfig(user2)
        expect(c3).toEqual(
            expect.objectContaining({
                featureVariationMap: {
                    '614ef6aa473928459060721a': '6153553b8cf4e45e0464268d',
                },
            }),
        )

        // cleanup
        setClientCustomDataJSON({})
    })
})
