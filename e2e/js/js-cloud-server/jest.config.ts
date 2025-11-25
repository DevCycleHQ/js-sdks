const config = {
    displayName: 'e2e-js-cloud-server',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    collectCoverage: false,
    maxWorkers: 1,
    testTimeout: 60000,
}

config.reporters = [
    'default',
    [
        'jest-junit',
        {
            outputDirectory: 'test-results',
            outputName: `${config.displayName}.xml`,
        },
    ],
]

module.exports = config
