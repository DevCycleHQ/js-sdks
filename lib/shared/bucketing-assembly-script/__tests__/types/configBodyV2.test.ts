import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import {
    testConfigBodyV2Class,
    testConfigBodyV2ClassFromUTF8,
    setConfigDataWithEtag,
    hasConfigDataForEtag,
} from '../bucketingImportHelper'
import cloneDeep from 'lodash/cloneDeep'
import immutable from 'object-path-immutable'
import { Feature } from '@devcycle/types'

import { configWithBucketingKey } from '../helpers/configWithBucketingKey'

const testConfigBodyV2 = (str: string, utf8: boolean): any => {
    if (utf8) {
        const buff = Buffer.from(str, 'utf8')
        return JSON.parse(testConfigBodyV2ClassFromUTF8(buff))
    } else {
        return JSON.parse(testConfigBodyV2Class(str))
    }
}

const postProcessedConfig = (config: unknown) => {
    const parsedConfig = JSON.parse(JSON.stringify(config))
    return immutable
        .wrap(parsedConfig)
        .set('project.settings', { disablePassthroughRollouts: false })
        .del('variableHashes')
        .set(
            'features',
            parsedConfig.features.map((feature: Feature) => {
                return immutable.set(
                    feature,
                    'configuration.targets',
                    feature.configuration.targets.map((target) => {
                        return immutable.del(target, '_audience._id')
                    }),
                )
            }),
        )
        .value()
}

describe.each([true, false])('Config Body V2', (utf8) => {
    const testConfig = configWithBucketingKey(
        'user_id',
    ) as typeof testData.config
    it('should parse valid JSON into ConfigBody class', () => {
        expect(testConfigBodyV2(JSON.stringify(testConfig), utf8)).toEqual(
            postProcessedConfig(testConfig),
        )
    })

    it('should parse if missing optional top level field', () => {
        const config = cloneDeep(testConfig)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete config.clientSDKKey
        expect(testConfigBodyV2(JSON.stringify(config), utf8)).toEqual(
            immutable.del(postProcessedConfig(testConfig), 'clientSDKKey'),
        )
    })
    it('should throw if target.rollout is missing type', () => {
        const config = cloneDeep(testConfig)
        const target: any = config.features[0].configuration.targets[0]
        target.rollout = {
            startDate: new Date(),
        }
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "type"',
        )
    })

    it('should parse target.bucketingKey exists', () => {
        const config = cloneDeep(testConfig)
        const target: any = config.features[0].configuration.targets[0]
        target.bucketingKey = 'bucketingKey'
        expect(testConfigBodyV2(JSON.stringify(config), utf8)).toEqual(
            postProcessedConfig(config),
        )
    })

    it('should parse startsWith/endsWith filter', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            comparator: 'startWith',
            subType: 'email',
            values: [],
        } as (typeof filters.filters)[0]
        expect(testConfigBodyV2(JSON.stringify(config), utf8)).toEqual(
            postProcessedConfig(config),
        )
    })

    it('should handle extended UTF8 characters, from UTF8: ' + utf8, () => {
        const testInvalidConfig = immutable.set(
            testConfig,
            'project.key',
            '👍 ö',
        )
        expect(
            testConfigBodyV2(JSON.stringify(testInvalidConfig), utf8),
        ).toEqual(postProcessedConfig(testInvalidConfig))
    })

    it('should throw if feature.type is missing not a valid type', () => {
        const config = cloneDeep(testConfig)
        const feature: any = config.features[0]
        feature.type = 'invalid'
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Invalid string value: invalid, for key: type, ' +
                'must be one of: release, experiment, permission, ops',
        )
    })

    it('should throw if audience is missing fields for user filter', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            comparator: '=',
        } as (typeof filters.filters)[0]
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Array not found for key: "values"',
        )
    })

    it('should not throw if audience is using invalid operator', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.operator = 'xylophone'
        expect(() =>
            testConfigBodyV2(JSON.stringify(config), utf8),
        ).not.toThrow()
    })

    it('should throw if audience is missing comparator for user filter', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            subType: 'subtype',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "comparator", obj: {"type":"user","values":[],"subType":"subtype"',
        )
    })

    it('should throw if custom data filter is missing dataKey', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKeyType: 'String',
            subType: 'customData',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "dataKey"',
        )
    })

    it('should throw if custom data filter is missing dataKeyType', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKey: 'datakey',
            subType: 'customData',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "dataKeyType"',
        )
    })

    it('should throw if custom data filter has invalid dataKeyType', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKey: 'datakey',
            dataKeyType: 'invalid',
            subType: 'customData',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBodyV2(JSON.stringify(config), utf8)).toThrow(
            'Invalid string value: invalid, for key: dataKeyType',
        )
    })

    it('should pass if audience is missing fields but type is all', () => {
        const config = cloneDeep(testConfig)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'all',
        } as (typeof filters.filters)[0]
        expect(() =>
            testConfigBodyV2(JSON.stringify(config), utf8),
        ).not.toThrow()
    })

    it('does not fail on multiple iterations of testConfigBodyClass', () => {
        for (let i = 0; i < 1000; i++) {
            testConfigBodyV2(JSON.stringify(testConfig), utf8)
        }
    })
})

describe('hasConfigDataForEtag', () => {
    it('should return true if config has data', () => {
        const sdkKey = 'sdkKey'
        const etag = 'etag'
        setConfigDataWithEtag(sdkKey, JSON.stringify(testData.config), etag)
        expect(hasConfigDataForEtag(sdkKey, etag)).toBe(true)
        expect(hasConfigDataForEtag(sdkKey, 'not-etag')).toBe(false)
        expect(hasConfigDataForEtag('not-sdk-key', etag)).toBe(false)
    })
})
