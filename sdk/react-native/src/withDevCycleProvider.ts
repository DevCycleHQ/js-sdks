import { withDevCycleProvider as ReactWithDevCycleProvider } from '@devcycle/devcycle-react-sdk'
import { getReactNativeConfig } from './DevCycleProvider'

export const withDevCycleProvider: typeof ReactWithDevCycleProvider = (
    config,
) => {
    const reactNativeConfig = getReactNativeConfig(config)
    return ReactWithDevCycleProvider(reactNativeConfig)
}

/**
 * @deprecated Use withDevCycleProvider instead
 */
export const withDVCProvider = withDevCycleProvider
