module.exports = {
    displayName: 'examples-js-web-elements-app',
    preset: '../../../jest.preset.ts',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
        '^.+\\.[tj]s$': 'babel-jest'
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/examples/js/web-elements-app'
}
