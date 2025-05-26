module.exports = {
    displayName: 'example-js-web-elements-app',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/dev-apps/js',
}
