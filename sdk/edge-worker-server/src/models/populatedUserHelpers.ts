import {
    DVCPopulatedUser,
    DevCycleUser,
    DevCyclePlatformDetails,
    DevCycleCloudOptions,
} from '@devcycle/js-cloud-server-sdk'
import * as packageJson from '../../package.json'

export function getPlatformDetails(
    options: DevCycleCloudOptions,
): DevCyclePlatformDetails {
    return {
        platform: 'EdgeWorker',
        platformVersion: options.platformVersion || '',
        sdkType: 'server',
        sdkVersion: packageJson.version,
        hostname: options.hostname || '',
    }
}

export function DVCPopulatedUserFromDevCycleUser(
    user: DevCycleUser,
    options: DevCycleCloudOptions,
): DVCPopulatedUser {
    return new DVCPopulatedUser(user, getPlatformDetails(options))
}
