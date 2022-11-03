// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx')
const withTM = require('next-transpile-modules')(['@devcycle/devcycle-js-sdk', '@devcycle/devcycle-react-sdk'])
const withPlugins = require('next-compose-plugins')

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
        svgr: false,
    },
}

const plugins = [ 
    [withNx]
]


module.exports = withTM(withPlugins([...plugins], nextConfig))

