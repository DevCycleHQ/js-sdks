import React from 'react'
import { DevCycleNextOptions, DevCycleServerData } from '../common/types'
import { InternalDevCycleClientsideProvider } from './internal/InternalDevCycleClientsideProvider'

export type DevCycleClientContext = {
    serverDataPromise: Promise<DevCycleServerData>
    clientSDKKey: string
    enableStreaming: boolean
    options: DevCycleNextOptions
}

type DevCycleClientsideProviderProps = {
    context: DevCycleClientContext
    children: React.ReactNode
}

export const DevCycleClientsideProvider = async ({
    context,
    children,
}: DevCycleClientsideProviderProps): Promise<React.ReactElement> => {
    const clientsideContext = {
        ...context,
        serverData: context.enableStreaming
            ? undefined
            : await context.serverDataPromise,
    }

    return (
        <InternalDevCycleClientsideProvider context={clientsideContext}>
            {children}
        </InternalDevCycleClientsideProvider>
    )
}
