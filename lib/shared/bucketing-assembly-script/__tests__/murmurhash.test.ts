import {testMurmurhashV3} from '../build/bucketing-lib.debug'
import murmurhash from 'murmurhash'
import {testMM3Internal} from "../build/bucketing-lib.debug";

function randstring(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+/.,<>?;:[]{}|';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

describe('Test testMurmurhashV3', () => {
    it('should return the correct hash for simple strings with a fixed seed', () => {
        // console.log(murmurhash.v3('Orange', 0))//1637794643
        // console.log(murmurhash.v3('Orange', 0))//1637794643
        // console.log(murmurhash.v3('some-long-ascii-string', 1000))//605439249
        // console.log(murmurhash.v3('some-long-ascii-string?', 1000))//784910028
        // console.log(murmurhash.v3('some-long-ascii-string!', 1000))//1791583627
        // console.log(murmurhash.v3('some-long-ascii-string*', 1000))//1578136692
        // console.log(murmurhash.v3('some-long-ascii-string@', 1000))//4263889436
        //
        console.log(`murmurhash internal test - should return 1 ${testMM3Internal('some-long-ascii-string@', 1000)}`)
        console.log(testMurmurhashV3('some-long-ascii-string@', 1000))
        // expect(testMurmurhashV3('Orange', 1)).toBe(murmurhash.v3('Orange', 1))
        // expect(testMurmurhashV3('some-long-ascii-string', 1000)).toEqual(murmurhash.v3('some-long-ascii-string', 1000))
        // expect(testMurmurhashV3('some-long-ascii-string?', 1000)).toEqual(murmurhash.v3('some-long-ascii-string?', 1000))
        // expect(testMurmurhashV3('some-long-ascii-string!', 1000)).toEqual(murmurhash.v3('some-long-ascii-string!', 1000))
        // expect(testMurmurhashV3('some-long-ascii-string*', 1000)).toEqual(murmurhash.v3('some-long-ascii-string*', 1000))
        // expect(testMurmurhashV3('some-long-ascii-string@', 1000)).toEqual(murmurhash.v3('some-long-ascii-string@', 1000))
    })

    it('should return the correct hash for simple strings with a varying seed', () => {
        for (let i = 1000; i < 2000; i+=2) {
            console.log(i)
            expect(testMurmurhashV3('some-long-ascii-string', i)).toEqual(murmurhash.v3('some-long-ascii-string', i))
            expect(testMurmurhashV3('some-long-ascii-string?', i)).toEqual(murmurhash.v3('some-long-ascii-string?', i))
            expect(testMurmurhashV3('some-long-ascii-string!', i)).toEqual(murmurhash.v3('some-long-ascii-string!', i))
            expect(testMurmurhashV3('some-long-ascii-string*', i)).toEqual(murmurhash.v3('some-long-ascii-string*', i))
        }
    })
/*
    it('should return the correct hash for random strings and a varying seed', () => {
        for (let i = 1; i < 1000; i++) {
            const key = randstring(16)M
            const wasmMMH = testMurmurhashV3(key, i)
            const jsMMH = murmurhash.v3(key, i)
            console.log(key, wasmMMH, jsMMH)
            expect(wasmMMH).toEqual(jsMMH)
        }
    })*/
})

///-111011011110000000111101011
///11111000100100001111111000010101