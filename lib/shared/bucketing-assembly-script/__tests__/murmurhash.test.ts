import { wasmModule } from '../node-module/asModule'
import murmurhash from 'murmurhash'
const { testMurmurhashV3, __newString } = wasmModule.exports

function callTestMurmurhashV3(key: string, seed: number): number {
    return testMurmurhashV3(__newString(key), seed)
}

describe('Test testMurmurhashV3', () => {
    it('should return the correct hash', () => {
        expect(callTestMurmurhashV3('test', 1000)).toEqual(murmurhash.v3('test', 1000))
    })
})
