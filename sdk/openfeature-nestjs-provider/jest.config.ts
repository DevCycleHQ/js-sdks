/* eslint-disable */
export default {
    displayName: 'openfeature-nestjs-provider',
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
    coverageDirectory: '../../coverage/sdk/openfeature-nestjs-provider',
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
}

module.exports.reporters = [
    'default',
    [
        'jest-junit',
        {
            outputDirectory: 'test-results',
            outputName: `${module.exports.displayName}.xml`,
        },
    ],
]
