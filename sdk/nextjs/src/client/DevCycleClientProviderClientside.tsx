'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DevCycleClient, initializeDevCycle } from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'
import { updateDVCCookie } from './updateDVCCookie'
import { invalidateConfig } from '../common/invalidateConfig'
import { DevCycleServerDataForClient } from '@devcycle/next-sdk'

type DevCycleClientProviderProps = {
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

export const DevCycleClientProviderClientSide = ({
    serverData,
    children,
}: DevCycleClientProviderProps) => {
    const router = useRouter()
    const clientRef = useRef<DevCycleClient>()
    const [previousContext, setPreviousContext] = useState<
        DevCycleServerDataForClient | undefined
    >()

    if (!clientRef.current) {
        clientRef.current = initializeDevCycle(
            serverData.sdkKey,
            serverData.user!,
            {
                bootstrapConfig: serverData.config,
                disableConfigCache: true,
            },
        )
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

    useEffect(() => {
        const handler = () => {
            // trigger an in-place refetch of server components
            console.log('REFRESHING FROM CONFIG CHANGE!')
            invalidateConfig(serverData.sdkKey).finally(() => {
                router.refresh()
            })
        }
        clientRef.current?.subscribe('configUpdated', handler)
        return () => {
            clientRef.current?.unsubscribe('configUpdated', handler)
        }
    }, [])

    return (
        <DevCycleClientContext.Provider
            value={{ client: clientRef.current, sdkKey: serverData.sdkKey }}
        >
            {children}
        </DevCycleClientContext.Provider>
    )
}
