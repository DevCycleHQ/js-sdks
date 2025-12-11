import type { Config } from 'jest'

const config: Config = {
    displayName: 'openfeature-web-provider',
    preset: '../../jest.preset.js',
    globals: {},
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js'],
    coverageDirectory: '../../coverage/sdk/openfeature-web-provider',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'openfeature-web-provider.xml',
            },
        ],
    ],
}

module.exports = config
