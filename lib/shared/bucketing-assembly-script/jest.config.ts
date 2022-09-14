const displayName = 'bucketing-lib-as'

export default {
    displayName,
    preset: '../../../jest.preset.js',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
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
        '<rootDir>/assembly/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}'
    ],
    coverageDirectory: '../../../coverage/lib/shared/bucketing',
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'test-results',
            outputName: `${displayName}.xml`,
        }]
    ]
}
