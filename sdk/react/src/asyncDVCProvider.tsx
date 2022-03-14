import { Provider } from './context'
import React from 'react'
import { ProviderConfig } from './types'
import initializeDVCClient from './initializeDVCClient'

export default async function asyncWithDVCProvider(config: ProviderConfig): Promise<React.FC> {
    const { envKey, user } = config

    const client = await initializeDVCClient(envKey, user)

    return ({ children }) => {
        return <Provider value={{ client, variables: {} }}>{children}</Provider>
    }
}
