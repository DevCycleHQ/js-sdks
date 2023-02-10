import { JSON } from 'assemblyscript-json/assembly'

const _clientCustomData: Map<string, JSON.Obj> = new Map()

export function _setClientCustomData(sdkKey: string, clientCustomData: JSON.Obj): void {
    _clientCustomData.set(sdkKey, clientCustomData)
}

export function _getClientCustomData(sdkKey: string): JSON.Obj {
    if (_clientCustomData.has(sdkKey)) {
        return _clientCustomData.get(sdkKey)
    }
    _setClientCustomData(sdkKey, new JSON.Obj())
    return _clientCustomData.get(sdkKey)
}
