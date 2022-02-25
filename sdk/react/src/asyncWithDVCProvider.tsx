import { Provider } from './context'
import React, { useContext, useState } from 'react'
import { ProviderConfig } from './types'
import initializeDVCClient from './initializeDVCClient'
import { DVCVariable } from 'dvc-js-client-sdk'
import context from './context'

export default async function asyncWithDVCProvider(config: ProviderConfig): Promise<React.FC> {
    const { envKey, user } = config

    const client = await initializeDVCClient(envKey, user)

    return ({ children }) => {
        return <Provider value={{ client, variables: {} }}>{children}</Provider>
    }
}
