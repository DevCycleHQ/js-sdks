import { DevCyclePlatformDetails } from '@devcycle/js-cloud-server-sdk'
import * as packageJson from '../../package.json'

function getNodeHostname(): string {
    try {
        const os = require('os')
        return os.hostname()
    } catch (e) {
        return 'edge-runtime'
    }
}

export function getNodeJSPlatformDetails(): DevCyclePlatformDetails {
    return {
        platform: 'NodeJS',
        platformVersion: process.version,
        sdkType: 'server',
        sdkVersion: packageJson.version,
        hostname: getNodeHostname(),
    }
}

export function getHostname(): string {
    return getNodeHostname()
}
