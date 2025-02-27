import {
    DevCycleOptionsLocalEnabled,
    DevCycleOptionsCloudEnabled,
    DevCycleProvider,
} from '@devcycle/nodejs-server-sdk'

// Re-export everything from the nodejs-server-sdk
export * from '@devcycle/nodejs-server-sdk'

function isCloudEnabled(
    options: DevCycleOptionsLocalEnabled | DevCycleOptionsCloudEnabled,
): options is DevCycleOptionsCloudEnabled {
    return options.enableCloudBucketing === true
}

export class DevCycleNestJSProvider extends DevCycleProvider {
    constructor(
        sdkKey: string,
        options: DevCycleOptionsLocalEnabled | DevCycleOptionsCloudEnabled = {},
    ) {
        const updatedOptions = {
            ...options,
            sdkPlatform: 'nestjs-of',
        }

        if (isCloudEnabled(updatedOptions)) {
            super(sdkKey, updatedOptions)
        } else {
            super(sdkKey, updatedOptions)
        }
    }
}
