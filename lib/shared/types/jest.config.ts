/* eslint-disable */
import type { Config } from 'jest'

const config: Config = {
    displayName: 'shared-types',
    globals: {},
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/lib/shared/types',
    preset: '../../../jest.preset.js',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'shared-types.xml',
            },
        ],
    ],
}

module.exports = config
