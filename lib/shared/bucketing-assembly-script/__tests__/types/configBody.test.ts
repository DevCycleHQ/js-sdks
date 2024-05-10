import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import {
    testConfigBodyClass,
    testConfigBodyClassFromUTF8,
    setConfigDataWithEtag,
    hasConfigDataForEtag,
} from '../bucketingImportHelper'
import cloneDeep from 'lodash/cloneDeep'

const testConfigBody = (str: string, utf8: boolean): any => {
    if (utf8) {
        const buff = Buffer.from(str, 'utf8')
        return JSON.parse(testConfigBodyClassFromUTF8(buff))
    } else {
        return JSON.parse(testConfigBodyClass(str))
    }
}

describe.each([true, false])('Config Body', (utf8) => {
    it('should parse valid JSON into ConfigBody class', () => {
        expect(testConfigBody(JSON.stringify(testData.config), utf8)).toEqual(
            JSON.parse(
                JSON.stringify({
                    ...testData.config,
                    project: {
                        ...testData.config.project,
                        settings: {
                            disablePassthroughRollouts: false
                        }
                    },
                    variableHashes: undefined,
                }),
            ),
        )
    })

    it('should parse if missing optional top level field', () => {
        const config = cloneDeep(testData.config)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete config.clientSDKKey
        expect(testConfigBody(JSON.stringify(config), utf8)).toEqual(
            JSON.parse(
                JSON.stringify({
                    ...testData.config,
                    project: {
                        ...testData.config.project,
                        settings: {
                            disablePassthroughRollouts: false
                        }
                    },
                    variableHashes: undefined,
                    clientSDKKey: undefined,
                }),
            ),
        )
    })
    it('should throw if target.rollout is missing type', () => {
        const config = cloneDeep(testData.config)
        const target: any = config.features[0].configuration.targets[0]
        target.rollout = {
            startDate: new Date(),
        }
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "type"',
        )
    })

    it('should handle extended UTF8 characters, from UTF8: ' + utf8, () => {
        const config = {
            ...testData.config,
            project: { ...testData.config.project, key: '👍 ö' },
        }
        expect(testConfigBody(JSON.stringify(config), utf8)).toEqual(
            JSON.parse(
                JSON.stringify({
                    ...config,
                    project: {
                        ...config.project,
                        settings: {
                            disablePassthroughRollouts: false
                        }
                    },
                    variableHashes: undefined,
                }),
            ),
        )
    })

    it('should throw if feature.type is missing not a valid type', () => {
        const config = cloneDeep(testData.config)
        const feature: any = config.features[0]
        feature.type = 'invalid'
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Invalid string value: invalid, for key: type, ' +
                'must be one of: release, experiment, permission, ops',
        )
    })

    it('should throw if audience is missing fields for user filter', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            comparator: '=',
        } as (typeof filters.filters)[0]
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Array not found for key: "values"',
        )
    })

    it('should not throw if audience is using invalid operator', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.operator = 'xylophone'
        expect(() => testConfigBody(JSON.stringify(config), utf8)).not.toThrow()
    })

    it('should throw if audience is missing comparator for user filter', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            subType: 'subtype',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "comparator", obj: {"type":"user","values":[],"subType":"subtype"',
        )
    })

    it('should throw if custom data filter is missing dataKey', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKeyType: 'String',
            subType: 'customData',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "dataKey"',
        )
    })

    it('should throw if custom data filter is missing dataKeyType', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKey: 'datakey',
            subType: 'customData',
        } as unknown as (typeof filters.filters)[0]
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Missing string value for key: "dataKeyType"',
        )
    })

    it('should throw if custom data filter has invalid dataKeyType', () => {
        const config = cloneDeep(testData.config)
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
        expect(() => testConfigBody(JSON.stringify(config), utf8)).toThrow(
            'Invalid string value: invalid, for key: dataKeyType',
        )
    })

    it('should pass if audience is missing fields but type is all', () => {
        const config = cloneDeep(testData.config)
        const filters =
            config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'all',
        } as (typeof filters.filters)[0]
        expect(() => testConfigBody(JSON.stringify(config), utf8)).not.toThrow()
    })

    it('does not fail on multiple iterations of testConfigBodyClass', () => {
        for (let i = 0; i < 1000; i++) {
            testConfigBody(JSON.stringify(testData.config), utf8)
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
