import type { Config } from 'jest'

const config: Config = {
    displayName: 'nestjs-server-sdk',
    globals: {},
    transform: {},
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    coverageDirectory: '../../coverage/sdk/nestjs-server-sdk',
    preset: '../../jest.preset.js',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'nestjs-server-sdk.xml',
            },
        ],
    ],
}

module.exports = config
