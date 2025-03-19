/* eslint-disable */
export default {
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
