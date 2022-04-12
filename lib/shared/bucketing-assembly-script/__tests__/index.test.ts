import { testConfigBodyClass } from '../build/bucketing-lib.debug'
import testData from '../../bucketing-test-data/json-data/testData.json'
import { setPlatformDataJSON } from './setPlatformData'

setPlatformDataJSON()

describe('WASM test', () => {
    it('should test ConfigBody class JSON parsing', () => {
        const result = JSON.parse(testConfigBodyClass(JSON.stringify(testData.config)))
        expect(result).toEqual(JSON.parse(JSON.stringify(testData.config)))
    })
})
