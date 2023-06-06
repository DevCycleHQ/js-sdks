import { withDVCProvider as ReactWithDVCProvider } from '@devcycle/devcycle-react-sdk'
import { getReactNativeConfig } from './DVCProvider'

export const withDVCProvider: typeof ReactWithDVCProvider = (config) => {
  const reactNativeConfig = getReactNativeConfig(config)
  return ReactWithDVCProvider(reactNativeConfig)
}
