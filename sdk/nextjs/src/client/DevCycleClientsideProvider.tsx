'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DevCycleClient, initializeDevCycle } from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'
import { updateDVCCookie } from './updateDVCCookie'
import { invalidateConfig } from '../common/invalidateConfig'
import { DevCycleServerDataForClient } from '@devcycle/next-sdk'

type DevCycleClientsideProviderProps = {
    serverData: DevCycleServerDataForClient
    children: React.ReactNode
}

type ClientProviderContext = {
    client: DevCycleClient
    sdkKey: string
}

export const DevCycleClientContext = React.createContext<ClientProviderContext>(
    {} as ClientProviderContext,
)

export const DevCycleClientsideProvider = ({
    serverData,
    children,
}: DevCycleClientsideProviderProps) => {
    const router = useRouter()
    const clientRef = useRef<DevCycleClient>()
    const [previousContext, setPreviousContext] = useState<
        DevCycleServerDataForClient | undefined
    >()

    const revalidateConfig = (lastModified?: number) => {
        invalidateConfig(serverData.sdkKey, lastModified).finally(() => {
            router.refresh()
        })
    }

    if (!clientRef.current) {
        clientRef.current = initializeDevCycle(
            serverData.sdkKey,
            serverData.user!,
            {
                bootstrapConfig: serverData.config,
                disableConfigCache: true,
                next: {
                    configRefreshHandler: revalidateConfig,
                },
            },
        )
        // TODO is this always true because the reference changes on re-render?
    } else if (previousContext != serverData) {
        // change user and config data to match latest server data
        // if the data has changed since the last invocation
        clientRef.current.synchronizeBootstrapData(
            serverData.config,
            serverData.user,
        )
        setPreviousContext(serverData)
    }

    updateDVCCookie(clientRef.current!)

    return (
        <DevCycleClientContext.Provider
            value={{ client: clientRef.current, sdkKey: serverData.sdkKey }}
        >
            {children}
        </DevCycleClientContext.Provider>
    )
}
