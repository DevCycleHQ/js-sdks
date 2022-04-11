import { ConfigBody } from '../types'

let _configData: Map<string, ConfigBody> = new Map()

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
