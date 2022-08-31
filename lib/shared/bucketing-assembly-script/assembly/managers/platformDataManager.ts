import { PlatformData } from '../types'

let _platformData: PlatformData | null = null

export function _setPlatformData(platformData: PlatformData): void {
    _platformData = platformData
}

export function _getPlatformData(): PlatformData {
    if (_platformData === null) {
        throw new Error('Platform data is not set.')
    } else {
        return _platformData as PlatformData
    }
}

export function _clearPlatformData(): void {
    _platformData = null
}
