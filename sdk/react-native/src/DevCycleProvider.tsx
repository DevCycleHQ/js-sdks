import React from 'react'
import { DevCycleProvider as ReactDVCProvider } from '@devcycle/devcycle-react-sdk'
import ReactNativeStore from './ReactNativeCacheStore'

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
            reactNative: true,
        },
    }
    if (!config.options?.storage) {
        rnConfig.options.storage = new ReactNativeStore()
    }
    return rnConfig
}
