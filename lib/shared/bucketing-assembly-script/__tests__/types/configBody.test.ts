import testData from '../../../bucketing-test-data/json-data/testData.json'
import { testConfigBodyClass } from '../../build/bucketing-lib.debug'
import _ from 'lodash'

describe('Config Body', () => {
    it('should parse valid JSON into ConfigBody class', () => {
        const result = JSON.parse(testConfigBodyClass(JSON.stringify(testData.config)))
        expect(result).toEqual(JSON.parse(JSON.stringify(testData.config)))
    })

    it('should throw if target.rollout is missing type', () => {
        const config = _.cloneDeep(testData.config)
        const target: any = config.features[0].configuration.targets[0]
        target.rollout = {
            startDate: new Date()
        }
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Missing string value for key: "type"')
    })

    it('should throw if feature.type is missing not a valid type', () => {
        const config = _.cloneDeep(testData.config)
        const feature: any = config.features[0]
        feature.type = 'invalid'
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Invalid string value: invalid, for key: type, ' +
                'must be one of: release, experiment, permission, ops')
    })

    it('should throw if audience is missing fields for user filter', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user'
        } as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Array not found for key: "values"')
    })

    it('should throw if audience is missing comparator for user filter', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            subType: 'subtype'
        } as unknown as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Invalid string value: subtype, for key: subType')
    })

    it('should throw if custom data filter is missing dataKey', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKeyType: 'String',
            subType: 'customData'
        } as unknown as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Missing string value for key: "dataKey"')
    })

    it('should throw if custom data filter is missing dataKeyType', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKey: 'datakey',
            subType: 'customData'
        } as unknown as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Missing string value for key: "dataKeyType"')
    })

    it('should throw if custom data filter has invalid dataKeyType', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'user',
            values: [],
            comparator: '=',
            dataKey: 'datakey',
            dataKeyType: 'invalid',
            subType: 'customData'
        } as unknown as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config)))
            .toThrow('Invalid string value: invalid, for key: dataKeyType')
    })

    it('should pass if audience is missing fields but type is all', () => {
        const config = _.cloneDeep(testData.config)
        const filters = config.features[0].configuration.targets[0]._audience.filters
        filters.filters[0] = {
            type: 'all'
        } as typeof filters.filters[0]
        expect(() => testConfigBodyClass(JSON.stringify(config))).not.toThrow()
    })
})
