import murmurhash from 'murmurhash'
import { murmurhashV3_js } from '../bucketingImportHelper'

function randString(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+/.,<>?;:[]{}|\'"'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

describe('murmurhash V3 Assembly Script implementation', () => {
    it('should return the correct hash for simple strings with a varying seed', () => {
        for (let i = 0; i < 2000; i++) {
            expect(murmurhashV3_js('some-long-ascii-string', i))
                .toContain(`${murmurhash.v3('some-long-ascii-string', i)}`)
            expect(murmurhashV3_js('some-long-ascii-string?', i))
                .toContain(`${murmurhash.v3('some-long-ascii-string?', i)}`)
            expect(murmurhashV3_js('some-long-ascii-string!', i))
                .toContain(`${murmurhash.v3('some-long-ascii-string!', i)}`)
            expect(murmurhashV3_js('some-long-ascii-string*', i))
                .toContain(`${murmurhash.v3('some-long-ascii-string*', i)}`)
        }
    })

    it('should return the correct hash for a random string with a varying seed', () => {
        for (let i = 0; i < 20000; i++) {
            const testString = randString(100)
            expect(murmurhashV3_js(testString, i)).toContain(`${murmurhash.v3(testString, i)}`)
        }
    })

    it('should not fail for a non-ascii key', () => {
        expect(() => murmurhashV3_js('\u11a7 5656 \u11a7', 1)).not.toThrow()
    })
})
