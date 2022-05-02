module.exports = {
    displayName: 'react-lib',
    
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/lib/react-lib','preset': '../../jest.preset.ts'
}
