import {
    initEventQueue,
    setPlatformData,
    setConfigData,
    cleanupEventQueue,
    clearPlatformData,
    setClientCustomData,
} from './bucketingImportHelper'

const defaultPlatformData = {
    platform: 'NodeJS',
    platformVersion: '',
    sdkType: 'server',
    sdkVersion: '1.0.0',
    deviceModel: '',
    hostname: 'host.name',
}

export const setPlatformDataJSON = (
    data: unknown = defaultPlatformData,
): void => {
    setPlatformData(JSON.stringify(data))
}

export const initSDK = (
    sdkKey: string,
    config: unknown = {},
    eventOptions: unknown = {},
    clientUUID = 'uuid',
): void => {
    initEventQueue(sdkKey, clientUUID, JSON.stringify(eventOptions))
    setPlatformData(
        JSON.stringify({
            platform: 'NodeJS',
            platformVersion: '16.0',
            sdkType: 'server',
            sdkVersion: '1.0.0',
            sdkPlatform: 'node',
            hostname: 'host.name',
        }),
    )
    setConfigData(sdkKey, JSON.stringify(config))
}

export const cleanupSDK = (sdkKey: string): void => {
    clearPlatformData()
    cleanupEventQueue(sdkKey)
    setClientCustomData(sdkKey, '{}')
}
