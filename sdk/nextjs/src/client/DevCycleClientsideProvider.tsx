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
import { DevCycleServerDataForClient } from '../common/types'

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

/**
 * Component which renders nothing, but runs code to keep client state in sync with server
 * Also waits for the server's data promise with the `use` hook. This triggers the nearest suspense boundary,
 * so this component is being rendered inside of a Suspense by the DevCycleClientsideProvider.
 * @param serverDataPromise
 * @constructor
 */
export const SuspendedProvider = ({
    serverDataPromise,
}: Pick<
    DevCycleClientsideProviderProps,
    'serverDataPromise'
>): React.ReactElement => {
    const serverData = use(serverDataPromise)
    const [previousContext, setPreviousContext] = useState<
        DevCycleServerDataForClient | undefined
    >()
    const context = useContext(DevCycleClientContext)
    if (previousContext !== serverData) {
        // change user and config data to match latest server data
        // if the data has changed since the last invocation
        context.client.synchronizeBootstrapData(
            serverData.config,
            serverData.user,
        )
        setPreviousContext(serverData)
    }
    return <></>
}

export const DevCycleClientsideProvider = ({
    serverDataPromise,
    sdkKey,
    enableStreaming,
    user,
    children,
}: DevCycleClientsideProviderProps): React.ReactElement => {
    const router = useRouter()
    const clientRef = useRef<DevCycleClient>()

    const revalidateConfig = (lastModified?: number) => {
        invalidateConfig(sdkKey, lastModified).finally(() => {
            router.refresh()
        })
    }

    if (!clientRef.current) {
        clientRef.current = initializeDevCycle(sdkKey, user!, {
            deferInitialization: true,
            disableConfigCache: true,
            next: {
                configRefreshHandler: revalidateConfig,
            },
        })
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
            <Suspense>
                <SuspendedProvider serverDataPromise={serverDataPromise} />
            </Suspense>
            {children}
        </DevCycleClientContext.Provider>
    )
}
