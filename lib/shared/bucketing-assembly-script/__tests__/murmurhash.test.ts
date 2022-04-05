import {testMurmurhashV3} from '../build/bucketing-lib.debug'
import murmurhash from 'murmurhash'
import {testMM3Internal} from "../build/bucketing-lib.debug";

function randstring(length: number) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+/.,<>?;:[]{}|\'"';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

describe('Test testMurmurhashV3 Assemblyscript implementation', () => {
    it('should return the correct hash for simple strings with a varying seed', () => {
        for (let i = 0; i < 2000; i++) {
            expect(testMM3Internal('some-long-ascii-string', i)).toContain(`${murmurhash.v3('some-long-ascii-string', i)}`)
            expect(testMM3Internal('some-long-ascii-string?', i)).toContain(`${murmurhash.v3('some-long-ascii-string?', i)}`)
            expect(testMM3Internal('some-long-ascii-string!', i)).toContain(`${murmurhash.v3('some-long-ascii-string!', i)}`)
            expect(testMM3Internal('some-long-ascii-string*', i)).toContain(`${murmurhash.v3('some-long-ascii-string*', i)}`)
        }
    })

    it('should return the correct hash for a random string with a varying seed', () => {
        for (let i = 0; i < 20000; i++) {
            const testString = randstring(100)
            expect(testMM3Internal(testString, i)).toContain(`${murmurhash.v3(testString, i)}`)
        }
    })
})