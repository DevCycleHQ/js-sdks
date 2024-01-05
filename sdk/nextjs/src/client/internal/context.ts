'use client'
import { DevCycleClient } from '@devcycle/js-client-sdk'
import React from 'react'

type ClientProviderContext = {
    client: DevCycleClient
    sdkKey: string
    enableStreaming: boolean
    serverDataPromise: Promise<unknown>
}

export const DevCycleProviderContext =
    React.createContext<ClientProviderContext>({} as ClientProviderContext)
