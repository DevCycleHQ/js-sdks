// copy-sdk.js
const fs = require('fs-extra')
const path = require('path')

const sdkSource = path.join(
    __dirname,
    '../../../../dist/sdk/cdn/js/devcycle.min.js',
)
const appDestination = path.join(__dirname, '../src/assets/devcycle.min.js')

fs.copy(sdkSource, appDestination, function (err) {
    if (err) {
        console.error('Error copying SDK:', err)
    } else {
        console.log('SDK copied successfully!')
    }
})
