'use client'
import React, { Suspense, use, useContext, useRef, useState } from 'react'
import {
    DevCycleClient,
    DevCycleUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'
import { updateDVCCookie } from './updateDVCCookie'
import { invalidateConfig } from '../common/invalidateConfig'
import { DevCycleServerDataForClient } from '@devcycle/next-sdk'

import { fallbackConfig } from '../common/fallbackConfig'

type DevCycleClientsideProviderProps = {
    serverDataPromise: Promise<DevCycleServerDataForClient>
    sdkKey: string
    user: DevCycleUser
    enableStreaming: boolean
    children: React.ReactNode
}

type ClientProviderContext = {
    client: DevCycleClient
    sdkKey: string
    enableStreaming: boolean
    serverDataPromise: Promise<unknown>
}

export const DevCycleClientContext = React.createContext<ClientProviderContext>(
    {} as ClientProviderContext,
)

export const SuspendedProvider = ({
    serverDataPromise,
    children,
}: Pick<DevCycleClientsideProviderProps, 'serverDataPromise' | 'children'>) => {
    const serverData = use(serverDataPromise)
    const [previousContext, setPreviousContext] = useState<
        DevCycleServerDataForClient | undefined
    >()
    const context = useContext(DevCycleClientContext)
    if (previousContext != serverData) {
        // change user and config data to match latest server data
        // if the data has changed since the last invocation
        context.client.synchronizeBootstrapData(
            serverData.config,
            serverData.user,
        )
        setPreviousContext(serverData)
        updateDVCCookie(context.client!)
    }
    return <>{children}</>
}

export const DevCycleClientsideProvider = ({
    serverDataPromise,
    sdkKey,
    enableStreaming,
    user,
    children,
}: DevCycleClientsideProviderProps) => {
    const router = useRouter()
    const clientRef = useRef<DevCycleClient>()

    const revalidateConfig = (lastModified?: number) => {
        console.log('SSE INVALIDATE!')
        invalidateConfig(sdkKey, lastModified).finally(() => {
            console.log('INVALIDATED')
            router.refresh()
        })
    }

    if (!clientRef.current) {
        clientRef.current = initializeDevCycle(sdkKey, user!, {
            bootstrapConfig: fallbackConfig,
            disableConfigCache: true,
            next: {
                configRefreshHandler: revalidateConfig,
                // eventsToTrack: serverData.events,
            },
        })
        updateDVCCookie(clientRef.current!)
    }

    return (
        <DevCycleClientContext.Provider
            value={{
                client: clientRef.current,
                sdkKey: sdkKey,
                enableStreaming,
                serverDataPromise,
            }}
        >
            <Suspense fallback={children}>
                <SuspendedProvider serverDataPromise={serverDataPromise}>
                    {children}
                </SuspendedProvider>
            </Suspense>
        </DevCycleClientContext.Provider>
    )
}
