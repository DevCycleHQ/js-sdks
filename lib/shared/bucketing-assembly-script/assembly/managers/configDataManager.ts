import { ConfigBody, Feature } from '../types'

const _configData: Map<string, ConfigBody> = new Map()

const _varKeyToFeatureMap: Map<string, Feature> = new Map()

export function _setConfigData(sdkKey: string, configData: ConfigBody): void {
    _configData.set(sdkKey, configData)
    for (let i = 0; i < configData.features.length; i++) {
        const feature = configData.features[i]
        for (let j = 0; j < feature.variations.length; j++) {
            for (let k = 0; k < feature.variations[j].variables.length; k++) {
                if (!_varKeyToFeatureMap.has(feature.variations[j].variables[k]._var)) {
                    _varKeyToFeatureMap.set(feature.variations[j].variables[k]._var, feature)
                }
            }
        }
    }
}

export function _getConfigData(sdkKey: string): ConfigBody {
    if (!_configData.has(sdkKey)) {
        throw new Error('Config data is not set.')
    } else {
        return _configData.get(sdkKey)
    }
}

export function _getFeatureForVarKey(varKey: string): Feature | null {
    if (!_varKeyToFeatureMap.has(varKey)) {
        return null
    } else {
        return _varKeyToFeatureMap.get(varKey)
    }
}
