import type { Config } from 'jest'

const config: Config = {
    displayName: 'nodejs-server-sdk',
    globals: {},
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    coverageDirectory: '../../coverage/sdk/nodejs-server-sdk',
    preset: '../../jest.preset.js',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'nodejs-server-sdk.xml',
            },
        ],
    ],
}

module.exports = config
