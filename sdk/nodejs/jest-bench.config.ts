/* eslint-disable */
export default {
    displayName: 'nodejs-server-sdk',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        }
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
        '^.+\\.[tj]sx?$':  'ts-jest'
    },
    testEnvironment: 'jest-bench/environment',
    reporters: ["default", "jest-bench/reporter"],
    // will pick up "*.bench.js" files or files in "__benchmarks__" folder.
    testRegex: "(/__benchmarks__/.*|\\.bench)\\.(ts|tsx|js)$",
    preset: '../../jest.preset.js'
}
