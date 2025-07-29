import { ConfigBodyV2 as ConfigBody, ConfigMetadata, ProjectMetadata, EnvironmentMetadata } from '../types'

const _configData: Map<string, ConfigBody> = new Map()
const _configMetadata: Map<string, string> = new Map()

export function _setConfigData(sdkKey: string, configData: ConfigBody): void {
    _configData.set(sdkKey, configData)
    _configMetadata.set(sdkKey, new ConfigMetadata(configData.project, configData.environment).stringify())
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

export function _getConfigMetadata(sdkKey: string): string {
    if (_configMetadata.has(sdkKey)) {
        return _configMetadata.get(sdkKey)
    } else {
        const config = _getConfigData(sdkKey)
        const metadata = new ConfigMetadata(config.project, config.environment).stringify()
        _configMetadata.set(sdkKey, metadata)
        return metadata
    }
}