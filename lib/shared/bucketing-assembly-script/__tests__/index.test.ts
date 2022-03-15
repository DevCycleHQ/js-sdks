import { wasmModule } from '../node-module/asModule'
import { config } from '../../bucketing/__test__/data/testData'

const { generateBucketedConfig, __newString, __getString } = wasmModule.exports

describe('WASM test', () => {

    it('should accept JSON config', () => {
        const user = {
            user_id: 'test_id'
        }

        const configStr = JSON.stringify(config)
        console.log('configStr: ' + configStr)
        const userStr = JSON.stringify(user)
        const resultAdr = generateBucketedConfig(
            __newString(configStr),
            __newString(userStr)
        )
        const result = __getString(resultAdr)
        console.log('result: ' + result)
        const resultJSON = JSON.parse(result)
        expect(resultJSON).toEqual(config)
    })
})
