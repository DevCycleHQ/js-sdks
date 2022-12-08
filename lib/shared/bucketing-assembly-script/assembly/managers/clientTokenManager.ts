const _clientTokenData: Set<string> = new Set()

export function _setClientTokenData(token: string): void {
    if (_clientTokenData.has(token)) {
        throw new Error('Client Token already exists.')
    } else {
        _clientTokenData.add(token)
    }
}

export function _clearClientTokenData(token: string): void {
    if (_clientTokenData.has(token)) {
        _clientTokenData.delete(token)
    }
}
