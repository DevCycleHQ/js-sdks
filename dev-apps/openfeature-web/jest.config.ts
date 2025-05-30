module.exports = {
    displayName: 'example-openfeature-web',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/dev-apps/openfeature-web',
}
