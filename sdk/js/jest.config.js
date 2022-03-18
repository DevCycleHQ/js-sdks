/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    displayName: 'js-client-sdk',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json'
        }
    },
    transform: {
        '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest'
    },
    testEnvironment: 'jsdom',
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,js}',
        '!<rootDir>/**/*.{spec,test,mock}.{ts,js}'
    ],
    coverageDirectory: '../../coverage/sdk/js',
    setupFiles: ['<rootDir>/__tests__/setupConfig.js']
}

module.exports.reporters = [
    'default',
    ['jest-junit', {
        outputDirectory: 'test-results',
        outputName: `${module.exports.displayName}.xml`,
    }]
]
