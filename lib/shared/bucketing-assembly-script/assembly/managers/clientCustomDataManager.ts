import { CustomDataValue } from '../types'

const _clientCustomData: Map<string, Map<string, CustomDataValue>> = new Map()

export function _setClientCustomData(sdkKey: string, clientCustomData: Map<string, CustomDataValue>): void {
    _clientCustomData.set(sdkKey, clientCustomData)
}

export function _getClientCustomData(sdkKey: string): Map<string, CustomDataValue> {
    if (_clientCustomData.has(sdkKey)) {
        return _clientCustomData.get(sdkKey)
    }
    _setClientCustomData(sdkKey, new Map<string, CustomDataValue>())
    return _clientCustomData.get(sdkKey)
}
