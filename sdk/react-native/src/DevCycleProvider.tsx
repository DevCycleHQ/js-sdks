import React from 'react'
import { DevCycleProvider as ReactDVCProvider } from '@devcycle/react-client-sdk'
import ReactNativeStore from './ReactNativeCacheStore'
import { ReactNativeSSEConnection } from './ReactNativeSSEConnection'

type PropsType = Parameters<typeof ReactDVCProvider>[0]

export const DevCycleProvider: typeof ReactDVCProvider = (props) => {
    const config = getReactNativeConfig(props.config)

    return <ReactDVCProvider config={config}>{props.children}</ReactDVCProvider>
}

/**
 * @deprecated Use DevCycleProvider instead
 */
export const DVCProvider = DevCycleProvider

export const getReactNativeConfig = (
    config: PropsType['config'],
): PropsType['config'] => {
    const rnConfig = {
        ...config,
        options: {
            ...config.options,
            sdkPlatform: 'react-native',
            reactNative: true,
            sseConnectionClass: ReactNativeSSEConnection,
        },
    }
    if (!config.options?.storage) {
        rnConfig.options.storage = new ReactNativeStore()
    }
    return rnConfig
}
