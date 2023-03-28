import {
    setPlatformData,
    setConfigData,
    variableForUser_PB as variableForUser_AS,
    variableForUser_PB_Preallocated as variableForUserPreallocated_AS,
    initEventQueue,
    clearPlatformData,
    cleanupEventQueue,
    setClientCustomData,
    VariableType
} from './bucketingImportHelper'
import { userToPB, variableForUserPB, variableForUserPBPreallocated } from './protobufVariableHelper'
import { SDKVariable } from '@devcycle/types'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import { ClientCustomData_PB } from '../protobuf/compiled'
const { config } = testData

type VariableForUserOptions = {
    sdkKey?: string,
    config?: unknown,
    user: unknown,
    variableKey: string,
    variableType: VariableType
}

export const variableForUser_PB = (
    { sdkKey = 'sdkKey', config, user, variableKey, variableType }: VariableForUserOptions
): SDKVariable | null => {
    if (config) {
        setConfigData(sdkKey, JSON.stringify(config))
    }
    return variableForUserPB({ sdkKey, user, variableKey, variableType })
}

export const variableForUser = (
    { sdkKey = 'sdkKey', config, user, variableKey, variableType }: VariableForUserOptions
): SDKVariable | null => {
    if (config) {
        setConfigData(sdkKey, JSON.stringify(config))
    }
    return variableForUserPB({ sdkKey, user, variableKey, variableType })
}

export const variableForUserPreallocated = (
    { sdkKey = 'sdkKey', config, user, variableKey, variableType }: VariableForUserOptions
): SDKVariable | null => {
    if (config) {
        setConfigData(sdkKey, JSON.stringify(config))
    }
    return variableForUserPBPreallocated({ sdkKey, user, variableKey, variableType })
}

export const initSDK = (sdkKey = 'sdkKey', projectConfig = config): void => {
    initEventQueue(sdkKey as string, JSON.stringify({}))
    setPlatformData(JSON.stringify({
        platform: 'NodeJS',
        platformVersion: '16.0',
        sdkType: 'server',
        sdkVersion: '1.0.0',
        hostname: 'host.name'
    }))
    setConfigData(sdkKey, JSON.stringify(projectConfig))
}

export const cleanupSDK = (sdkKey = 'sdkKey'): void => {
    clearPlatformData()
    cleanupEventQueue(sdkKey)
    setClientCustomData(sdkKey, ClientCustomData_PB.encode({}).finish())
}
