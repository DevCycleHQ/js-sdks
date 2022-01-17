module.exports = {
    displayName: 'shared-ts-types',
    preset: '../../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        }
    },
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}'
    ],
    coverageDirectory: '../../../coverage/lib/shared/ts-types'
}

module.exports.reporters = [
    'default',
    ['jest-junit', {
        outputDirectory: 'test-results',
        outputName: `${module.exports.displayName}.xml`,
    }]
]
