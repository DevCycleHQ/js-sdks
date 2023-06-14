const displayName = 'bucketing-lib-as'

export default {
    displayName,
    preset: '../../../jest.preset.js',
    globals: {},
    setupFiles: ['<rootDir>/__tests__/setup.js'],
    testEnvironment: 'node',
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!@assemblyscript/.*)'],
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverage: false,
    collectCoverageFrom: [
        '<rootDir>/assembly/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}',
    ],
    coverageDirectory: '../../../coverage/lib/shared/bucketing',
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: `${displayName}.xml`,
            },
        ],
    ],
}
