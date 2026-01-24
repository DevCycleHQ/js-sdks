import type { Config } from 'jest'

const config: Config = {
    displayName: 'bucketing-lib',

    globals: {},
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    coverageDirectory: '../../../coverage/lib/shared/bucketing',
    preset: '../../../jest.preset.js',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'bucketing-lib.xml',
            },
        ],
    ],
}

module.exports = config
