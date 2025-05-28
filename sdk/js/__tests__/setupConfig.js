// Polyfill for Web Crypto API in Node.js environment
if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = require('crypto');
    globalThis.crypto = webcrypto;
}

Object.defineProperty(
    window.navigator,
    'userAgent',
    ((value) => ({
        get() {
            return value
        },
        set(v) {
            value = v
        },
    }))(window.navigator['userAgent']),
)
