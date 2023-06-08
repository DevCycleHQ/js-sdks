/* eslint-disable */
// import * as preset from '../../../jest.preset'
const displayName = 'bucketing-lib-as-benchmark'

export default {
    displayName,
    preset: '../../../jest.preset',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'jest-bench/environment',
    testEnvironmentOptions: {
        // still Jest-bench environment will run your environment if you specify it here
        testEnvironment: 'jest-environment-node',
        testEnvironmentOptions: {
            // specify any option for your environment
        },
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!@assemblyscript/.*)'],
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    reporters: ['default', 'jest-bench/reporter'],
    testMatch: undefined,
    // will pick up "*.bench.js" files or files in "__benchmarks__" folder.
    testRegex: '(/__benchmarks__/.*|\\.bench)\\.(ts|tsx|js)$',
}
