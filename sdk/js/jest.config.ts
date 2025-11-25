import type { Config } from 'jest'

const config: Config = {
    displayName: 'js-client-sdk',
    globals: {},
    transform: {
        '^.+\\.(ts|tsx|js|jsx)?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    testEnvironment: 'jsdom',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    coverageDirectory: '../../coverage/sdk/js',
    setupFiles: ['<rootDir>/__tests__/setupConfig.js'],
    preset: '../../jest.preset.js',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'js-client-sdk.xml',
            },
        ],
    ],
}

module.exports = config
