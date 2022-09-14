module.exports = {
    displayName: 'example-js-web-elements-app',
    preset: '../../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
        '^.+\\.[tj]s$': 'babel-jest'
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/examples/js/web-elements-app'
}
