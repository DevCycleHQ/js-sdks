module.exports = {
    displayName: 'shared-types',
    preset: '../../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        }
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/lib/shared/types'
}

module.exports.reporters = [
    'default',
    ['jest-junit', {
        outputDirectory: 'test-results',
        outputName: `${module.exports.displayName}.xml`,
    }]
]
