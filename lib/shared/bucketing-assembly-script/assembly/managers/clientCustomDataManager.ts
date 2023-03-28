import { CustomDataValue } from '../types'
import { JSON } from 'assemblyscript-json/assembly'
import { getJSONObjFromCustomDataMap } from '../helpers/jsonHelpers'

const _clientCustomData: Map<string, Map<string, CustomDataValue>> = new Map()
const _clientCustomDataJSON: Map<string, JSON.Obj> = new Map()

export function _setClientCustomData(sdkKey: string, clientCustomData: Map<string, CustomDataValue>): void {
    _clientCustomData.set(sdkKey, clientCustomData)
    _clientCustomDataJSON.set(sdkKey, getJSONObjFromCustomDataMap(clientCustomData))
}

export function _getClientCustomData(sdkKey: string): Map<string, CustomDataValue> {
    if (_clientCustomData.has(sdkKey)) {
        return _clientCustomData.get(sdkKey)
    }
    _setClientCustomData(sdkKey, new Map<string, CustomDataValue>())
    return _clientCustomData.get(sdkKey)
}

export function _getClientCustomDataJSON(sdkKey: string): JSON.Obj {
    if (_clientCustomDataJSON.has(sdkKey)) {
        return _clientCustomDataJSON.get(sdkKey)
    }
    _setClientCustomData(sdkKey, new Map<string, CustomDataValue>())
    return _clientCustomDataJSON.get(sdkKey)
}
