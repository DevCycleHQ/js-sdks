import { Provider } from './context'
import React from 'react'
import { ProviderConfig } from './types'
import initializeDVCClient from './initializeDVCClient'

type Props = {
    children?: React.ReactNode
}

export default async function asyncWithDVCProvider(config: ProviderConfig): Promise<React.FC<Props>> {
    const { envKey, user, options } = config

    const client = initializeDVCClient(envKey, user, options)
    await client.onClientInitialized()

    return ({ children }) => {
        return <Provider value={{ client }}>{children}</Provider>
    }
}
