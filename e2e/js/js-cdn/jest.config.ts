/* eslint-disable */
export default {
    displayName: 'js-cdn',
    preset: '../../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
        '^.+\\.[tj]s$': '@swc/jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/e2e/js/js-cdn',
}
