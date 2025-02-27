import {
    DevCycleOptionsLocalEnabled,
    DevCycleOptionsCloudEnabled,
    DevCycleProvider,
} from '@devcycle/nodejs-server-sdk'

// Re-export everything from the nodejs-server-sdk
export * from '@devcycle/nodejs-server-sdk'

export class DevCycleNestJSProvider extends DevCycleProvider {
    constructor(
        sdkKey: string,
        options: DevCycleOptionsLocalEnabled | DevCycleOptionsCloudEnabled = {},
    ) {
        const updatedOptions = {
            ...options,
            sdkPlatform: 'nestjs-of',
        }

        if (options.enableCloudBucketing === true) {
            super(sdkKey, { ...updatedOptions, enableCloudBucketing: true })
        } else {
            super(sdkKey, { ...updatedOptions, enableCloudBucketing: false })
        }
    }
}
