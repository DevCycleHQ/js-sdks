import { DevCyclePlatformDetails } from '@devcycle/js-cloud-server-sdk'
import * as packageJson from '../../package.json'
import os from 'os'

export function getNodeJSPlatformDetails(): DevCyclePlatformDetails {
    return {
        platform: 'NodeJS',
        platformVersion: process.version,
        sdkType: 'server',
        sdkVersion: packageJson.version,
        hostname: os.hostname(),
    }
}
