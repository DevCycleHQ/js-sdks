import { CustomDataValuePB } from '../types/dvcUserPB'

const _clientCustomData: Map<string, Map<string, CustomDataValuePB>> = new Map()

export function _setClientCustomData(sdkKey: string, clientCustomData: Map<string, CustomDataValuePB>): void {
    _clientCustomData.set(sdkKey, clientCustomData)
}

export function _getClientCustomData(sdkKey: string): Map<string, CustomDataValuePB> {
    if (_clientCustomData.has(sdkKey)) {
        return _clientCustomData.get(sdkKey)
    }
    _setClientCustomData(sdkKey, new Map<string, CustomDataValuePB>())
    return _clientCustomData.get(sdkKey)
}
