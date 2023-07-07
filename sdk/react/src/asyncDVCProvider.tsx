import { Provider } from './context'
import React from 'react'
import { ProviderConfig } from './types'
import initializeDevCycleClient from './initializeDevCycleClient'

type Props = {
    children?: React.ReactNode
}

/**
 * @deprecated Use the `useIsDevCycleInitialized` hook to block rendering of your application
 *             until SDK initialization is complete
 */
export default async function asyncWithDVCProvider(
    config: ProviderConfig,
): Promise<React.FC<Props>> {
    const { user, options } = config
    let sdkKey: string
    if ('sdkKey' in config) {
        sdkKey = config.sdkKey
    } else {
        sdkKey = config.envKey
    }
    if (!sdkKey) {
        throw new Error('You must provide a sdkKey to asyncWithDVCProvider')
    }

    const client = initializeDevCycleClient(sdkKey, user, options)
    await client.onClientInitialized()

    return ({ children }) => {
        return <Provider value={{ client }}>{children}</Provider>
    }
}
