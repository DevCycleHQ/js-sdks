import {
    setPlatformData,
    setConfigData,
    variableForUser as variableForUser_AS,
    variableForUserPreallocated as variableForUserPreallocated_AS,
    initEventQueue,
    clearPlatformData,
    cleanupEventQueue,
    setClientCustomData,
    VariableType
} from './bucketingImportHelper'
import { variableForUserPB } from './protobufVariableHelper'
import { SDKVariable } from '@devcycle/types'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
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
    const userJSON = JSON.stringify(user)
    const variableJSON = variableForUser_AS(
        sdkKey, userJSON, variableKey, variableType, true
    )
    return variableJSON ? JSON.parse(variableJSON) as SDKVariable : null
}

export const variableForUserPreallocated = (
    { sdkKey = 'sdkKey', config, user, variableKey, variableType }: VariableForUserOptions
): SDKVariable | null => {
    if (config) {
        setConfigData(sdkKey, JSON.stringify(config))
    }
    const userRaw = JSON.stringify(user)
    const userJSON = userRaw + 'blahblahblah'
    const variableKeyPreallocated = variableKey + 'blahblahblahasdasd'
    const variableJSON = variableForUserPreallocated_AS(
        sdkKey, userJSON, userRaw.length, variableKeyPreallocated, variableKey.length, variableType, true
    )
    return variableJSON ? JSON.parse(variableJSON) as SDKVariable : null
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
    setClientCustomData(sdkKey, '{}')
}
