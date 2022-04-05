export function testInternal(key: string, seed: u32): string {
    if(key == "Orange" && seed == 0) return `${murmurhashV3(key, seed) == 1637794643} - ${murmurhashV3(key, seed)}`;
    if(key == "some-long-ascii-string" && seed == 1000) return `${murmurhashV3(key, seed) == 605439249} - ${murmurhashV3(key, seed)}`;
    if(key == "some-long-ascii-string@" && seed == 1000) return `${murmurhashV3(key, seed) == 4263889436} - ${murmurhashV3(key, seed)}`;
    return `${murmurhashV3(key, seed)}`;
}

//
// function mm3cpp(key: string, seed: u32): u32 {
//
//     let keyBuffer = new Int32Array(key.length);
//     for (let i = 0; i < key.length; i++) {
//         let charCode = i32(key.charCodeAt(i))
//         if (charCode > 255) {
//             throw new Error("Unsupported character in key.");
//         }
//         keyBuffer[i] = charCode
//     }
//
//     const len = keyBuffer.length
//     const nblocks = keyBuffer.length - (len & 3)
//     let h1 = seed;
//
//     const c1 = 0xcc9e2d51;
//     const c2 = 0x1b873593;
//
//     //----------
//     // body
//
//     for (let i = 0; i < nblocks; i++) {
//         let k1 = keyBuffer[i];
//
//         k1 *= c1;
//         k1 = k1 << 15;
//         k1 *= c2;
//
//         h1 ^= k1;
//         h1 = h1 << 13;
//         h1 = h1 * 5 + 0xe6546b64;
//     }
//
//     //----------
//     // tail
//
//     let k1 = 0;
//
//     switch (len & 3) {
//         case 3:
//             k1 ^= keyBuffer[2] << 16;
//         case 2:
//             k1 ^= keyBuffer[1] << 8;
//         case 1:
//             k1 ^= keyBuffer[0];
//             k1 *= c1;
//             k1 = k1 << 15;
//             k1 *= c2;
//             h1 ^= k1;
//             break;
//     }
//
//     //----------
//     // finalization
//
//     h1 ^= len;
//
//     h1 ^= h1 >> 16;
//     h1 *= 0x85ebca6b;
//     h1 ^= h1 >> 13;
//     h1 *= 0xc2b2ae35;
//     h1 ^= h1 >> 16;
//
//     return h1 as u32
// }


export function murmurhashV3(key: string, seed: i32): u32 {
    if (seed < 0) {
        throw new Error("Seed must be positive.")
    }
    let keyBuffer = new Int32Array(key.length);
    for (let i = 0; i < key.length; i++) {
        let charCode = i32(key.charCodeAt(i))
        if (charCode > 255) {
            throw new Error("Unsupported character in key.");
        }
        keyBuffer[i] = charCode
    }

    let remainder: i32, bytes: i32, h1b: i32, c1: i32, c2: i32, k1: i32, i: i32;

    let h1: i32;

    remainder = key.length & 3;
    bytes = keyBuffer.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
            ((keyBuffer[i] & 0xff)) |
            ((keyBuffer[++i] & 0xff) << 8) |
            ((keyBuffer[++i] & 0xff) << 16) |
            ((keyBuffer[++i] & 0xff) << 24);
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
            k1 ^= (keyBuffer[i + 2] & 0xff) << 16;
        case 2:
            k1 ^= (keyBuffer[i + 1] & 0xff) << 8;
        case 1:
            k1 ^= (keyBuffer[i] & 0xff);
            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= keyBuffer.length;

    console.log(`wasmH1_0: ${h1}`);
    h1 ^= h1 >>> 16;
    console.log(`wasmH1_1: ${h1}`);
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= h1 >>> 13;

    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    console.log(`wasmH1_2: ${h1}`);
    h1 ^= h1 >>> 16;
    console.log(`wasmH1_3: ${h1}`);
    return h1 as u32;
}
