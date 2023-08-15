import { JSON } from '@devcycle/assemblyscript-json/assembly'

const _clientCustomData: Map<string, JSON.Obj> = new Map()

export function _setClientCustomData(sdkKey: string, clientCustomData: JSON.Obj): void {
    _clientCustomData.set(sdkKey, clientCustomData)
}

export function _getClientCustomData(sdkKey: string): JSON.Obj {
    if (_clientCustomData.has(sdkKey)) {
        return _clientCustomData.get(sdkKey)
    }
    const clientCustomData = new JSON.Obj()
    _setClientCustomData(sdkKey, clientCustomData)
    return clientCustomData
}
