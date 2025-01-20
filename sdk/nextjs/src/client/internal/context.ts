'use client'
import {
    DevCycleClient,
    DVCCustomDataJSON,
    VariableDefinitions,
} from '@devcycle/js-client-sdk'
import React from 'react'

export type DevCycleNextClient<
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
> = Omit<
    DevCycleClient<Variables, CustomData>,
    | 'onClientInitialized'
    | 'identifyUser'
    | 'resetUser'
    | 'synchronizeBootstrapData'
>

type ClientProviderContext = {
    client: DevCycleNextClient
    clientSDKKey: string
    enableStreaming: boolean
    serverDataPromise: Promise<unknown>
}

export const DevCycleProviderContext =
    React.createContext<ClientProviderContext>({} as ClientProviderContext)
