/* eslint-disable */
export default {
    displayName: 'server-request',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            { tsconfig: '<rootDir>/tsconfig.spec.json' },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/lib/shared/server-request',
}
