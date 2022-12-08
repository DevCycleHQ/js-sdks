import { ConfigBody } from '../types'

const _configData: Map<string, ConfigBody> = new Map()

export function _setConfigData(token: string, configData: ConfigBody): void {
    _configData.set(token, configData)
}

export function _getConfigData(token: string): ConfigBody {
    if (!_configData.has(token)) {
        throw new Error('Config data is not set.')
    } else {
        return _configData.get(token)
    }
}

export function _clearConfigData(token: string): void {
    if (_configData.has(token)) {
        _configData.delete(token)
    }
}
