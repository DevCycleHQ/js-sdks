import { ConfigBodyV2 as ConfigBody } from '../types'

const _configData: Map<string, ConfigBody> = new Map()

export function _setConfigData(sdkKey: string, configData: ConfigBody): void {
    _configData.set(sdkKey, configData)
}

export function _getConfigData(sdkKey: string): ConfigBody {
    if (!_configData.has(sdkKey)) {
        throw new Error('Config data is not set.')
    } else {
        return _configData.get(sdkKey)
    }
}

export function _hasConfigData(sdkKey: string): bool {
    return _configData.has(sdkKey)
}
