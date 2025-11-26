import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
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
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'e2e-js-cloud-server.xml',
            },
        ],
    ],
}

export default config
