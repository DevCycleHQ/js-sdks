// copy-sdk.js
const fs = require('fs-extra')
const path = require('path')

const sdkSource = path.join(
    __dirname,
    '../../../../dist/sdk/cdn/js/devcycle.min.js',
)
const appDestination = path.join(__dirname, '../src/assets/devcycle.min.js')

try {
    fs.copySync(sdkSource, appDestination)
    console.log('SDK copied successfully!')
} catch (err) {
    console.error('Error copying SDK:', err)
    process.exit(1) // Exit with an error code if copy fails
}
