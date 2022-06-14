import { Provider } from './context'
import React from 'react'
import { ProviderConfig } from './types'
import initializeDVCClient from './initializeDVCClient'

type Props = {
    children?: React.ReactNode
}

/**
 *
 * @deprecated Use the `useDVCInitialized` hook to block rendering of your application
 *             until SDK initialization is complete
 *
 */
export default async function asyncWithDVCProvider(config: ProviderConfig): Promise<React.FC<Props>> {
    const { envKey, user, options } = config

    const client = initializeDVCClient(envKey, user, options)
    await client.onClientInitialized()

    return ({ children }) => {
        return <Provider value={{ client }}>{children}</Provider>
    }
}
