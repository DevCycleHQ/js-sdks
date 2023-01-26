import { Provider } from './context'
import React from 'react'
import { ProviderConfig } from './types'
import initializeDVCClient from './initializeDVCClient'

type Props = {
    children?: React.ReactNode
}

/**
 *
 * @deprecated Use the `useIsDVCInitialized` hook to block rendering of your application
 *             until SDK initialization is complete
 *
 */
export default async function asyncWithDVCProvider(config: ProviderConfig): Promise<React.FC<Props>> {
    const { sdkKey, user, options } = config

    const client = initializeDVCClient(sdkKey, user, options)
    await client.onClientInitialized()

    return ({ children }) => {
        return <Provider value={{ client }}>{children}</Provider>
    }
}
