const { withNxMetro } = require('@nx/react-native')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const exclusionList = require('metro-config/src/defaults/exclusionList')

const defaultConfig = getDefaultConfig(__dirname)
const { assetExts, sourceExts } = defaultConfig.resolver

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
    transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
        assetExts: assetExts.filter((ext) => ext !== 'svg'),
        sourceExts: [...sourceExts, 'svg'],
        
            /^(?!.*node_modules).*\/dist\/.*/,
            // Need to add the nodejs example apps to the exclude list to avoid
            // metro file mapper from complaining about duplicate file/mocks.
            // This happens because the nodejs example apps have the same name in their package.json
            /.*nodejs.*/,
        ]),
        
        
    },
}

module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
    // Change this to true to see debugging info.
    // Useful if you have issues resolving modules
    debug: false,
    // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
    extensions: [],
    // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
    watchFolders: [],
})
