/* eslint-disable */
// Linter disabled due to this code depending on semicolons etc.
import { unicodeCharEscape } from './stringHelpers'

export function murmurhashV3_js(key: string, seed: u32): string {
    return `${murmurhashV3(key, seed)}`
}

// NOTE: update the test in murmurhash.test.ts if this value is changed (or figure out how to import it in the test)
export const murmurhashBufferSize = 2000

const keyBuffer = new StaticArray<i32>(murmurhashBufferSize)

export function murmurhashV3(key: string, seed: u32): u32 {
    let currentBuffer = keyBuffer
    if (key.length > keyBuffer.length) {
        console.log("Warning: exceeded maximum size of murmurhash buffer.")
        currentBuffer = new StaticArray<i32>(key.length)
    }

    for (let i = 0; i < key.length; i++) {
        const charCode: i32 = key.charCodeAt(i)
        if (charCode > 127) {
            unchecked(currentBuffer[i] = unicodeCharEscape(charCode).charCodeAt(0))
        } else {
            unchecked(currentBuffer[i] = charCode)
        }
    }

    const length = key.length;

    let remainder: i32, bytes: i32, h1b: i32, c1: i32, c2: i32, k1: i32, i: i32, h1: i32;

    remainder = key.length & 3;
    bytes = length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
            ((unchecked(currentBuffer[i]) & 0xff)) |
            ((unchecked(currentBuffer[++i]) & 0xff) << 8) |
            ((unchecked(currentBuffer[++i]) & 0xff) << 16) |
            ((unchecked(currentBuffer[++i]) & 0xff) << 24);
        ++i;


        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3:
            k1 ^= (unchecked(currentBuffer[i + 2]) & 0xff) << 16;
        case 2:
            k1 ^= (unchecked(currentBuffer[i + 1]) & 0xff) << 8;
        case 1:
            k1 ^= (unchecked(currentBuffer[i]) & 0xff);
            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= length;


    h1 ^= h1 >>> 16;

    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= h1 >>> 13;

    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= h1 >>> 16;

    return h1 as u32;
}
