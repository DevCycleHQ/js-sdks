module.exports = {
    displayName: 'bucketing-lib-as',
    preset: '../../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        }
    },
    testEnvironment: 'node',
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!@assemblyscript/.*)'
    ],
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverage: false,
    collectCoverageFrom: [
        '<rootDir>/assembly-script-src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}'
    ],
    coverageDirectory: '../../../coverage/lib/shared/bucketing',
}

module.exports.reporters = [
    'default',
    ['jest-junit', {
        outputDirectory: 'test-results',
        outputName: `${module.exports.displayName}.xml`,
    }]
]
