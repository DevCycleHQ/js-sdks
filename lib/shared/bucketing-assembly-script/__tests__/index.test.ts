import { wasmModule } from '../node-module/asModule'
import { barrenConfig } from '../../bucketing/__test__/data/testData'

const { generateBucketedConfig, __newString, __getString } = wasmModule.exports

describe('WASM test', () => {
    it('should accept JSON config', () => {
        const user = {
            user_id: 'test_id'
        }

        const configStr = JSON.stringify(barrenConfig)
        const userStr = JSON.stringify(user)
        const result = generateBucketedConfig(
            __newString(configStr),
            __newString(userStr)
        )
        console.log('result: ' + __getString(result))
        expect(result).not.toBeNull()
    })
})
