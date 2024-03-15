/* eslint-disable */
export default {
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
