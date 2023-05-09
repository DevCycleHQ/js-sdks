module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    rhino: '1.7',
                },
                useBuiltIns: 'usage',
                corejs: 3,
            },
        ],
        '@babel/preset-typescript',
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
    ],
}
