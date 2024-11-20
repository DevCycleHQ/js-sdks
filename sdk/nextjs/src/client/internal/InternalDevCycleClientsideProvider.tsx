'use client'
import React, { Suspense, use, useEffect, useRef } from 'react'
import { DevCycleClient, initializeDevCycle } from '@devcycle/js-client-sdk'
import { invalidateConfig } from '../../common/invalidateConfig'
import { DevCycleNextOptions, DevCycleServerData } from '../../common/types'
import { DevCycleProviderContext } from './context'
import { useRouter } from 'next/navigation'

export type DevCycleClientContext = {
    serverDataPromise: Promise<DevCycleServerData>
    serverData?: DevCycleServerData
    clientSDKKey: string
    options: DevCycleNextOptions
    enableStreaming: boolean
    realtimeDelay?: number
}

type DevCycleClientsideProviderProps = {
    context: DevCycleClientContext
    children: React.ReactNode
}

const isServer = typeof window === 'undefined'

/**
 * keep the clientside instance of the SDK up-to-date with new data coming from the server during realtime updates
 * @param serverDataPromise
 * @param client
 * @param skipInitialSync
 * @constructor
 */
const SynchronizeClientData = ({
    serverDataPromise,
    client,
    skipInitialSync,
}: {
    serverDataPromise: Promise<DevCycleServerData>
    client: DevCycleClient
    skipInitialSync: boolean
}) => {
    const serverData = use(serverDataPromise)
    const dataRef = useRef<DevCycleServerData | null>(
        // if we already triggered synchronization on the first pass, set this to the resolved data so the below check
        // doesn't run again until the data changes. Otherwise set it to null so that we run the synchronization
        skipInitialSync ? serverData : null,
    )
    const clientRef = useRef<DevCycleClient>(client)

    if (dataRef.current !== serverData || clientRef.current !== client) {
        dataRef.current = serverData
        clientRef.current = client
        // do this in a timeout to avoid setting React state in components that are subscribed to variables as a
        // side effect of the current render, since this causes errors. Instead schedule the update to occur after
        // render completes
        setTimeout(() =>
            client.synchronizeBootstrapData(serverData.config, serverData.user),
        )
    }

    return null
}

export const InternalDevCycleClientsideProvider = ({
    context,
    children,
}: DevCycleClientsideProviderProps): React.ReactElement => {
    const clientRef = useRef<DevCycleClient>()
    const router = useRouter()
    const skipInitialSync = useRef(false)

    const { serverDataPromise, serverData, clientSDKKey, enableStreaming } =
        context

    const revalidateConfig = async (lastModified?: number) => {
        if (context.realtimeDelay) {
            // wait configured delay before checking for new config
            await new Promise((resolve) =>
                setTimeout(resolve, context.realtimeDelay),
            )
        }
        try {
            await invalidateConfig(
                clientSDKKey,
                serverData?.user.user_id ?? null,
            )
        } catch {
            // do nothing on failure, this is best effort
        }
        if (context.realtimeDelay) {
            // if delay is configured, assume that the server action invalidation won't update any content and just
            // call for a full in-place refresh
            router.refresh()
        }
    }

    if (!clientRef.current) {
        skipInitialSync.current = false
        clientRef.current = initializeDevCycle(clientSDKKey, {
            ...context.options,
            sdkPlatform: 'nextjs',
            deferInitialization: true,
            disableConfigCache: true,
            ...(isServer
                ? {
                      disableAutomaticEventLogging: true,
                      disableCustomEventLogging: true,
                  }
                : {}),
            next: {
                configRefreshHandler: revalidateConfig,
            },
        })

        if (!enableStreaming) {
            const resolvedServerData = use(serverDataPromise)
            // we expect that either the promise has resolved and we got the server data that way, or we weren't in
            // streaming mode and so the promise was awaited at a higher level and passed in here as serverData
            if (!resolvedServerData) {
                throw new Error(
                    'Server data should be available. Please contact DevCycle support.',
                )
            }
            skipInitialSync.current = true
            clientRef.current.synchronizeBootstrapData(
                resolvedServerData.config,
                resolvedServerData.user,
                resolvedServerData.userAgent,
            )
        }
    }

    return (
        <DevCycleProviderContext.Provider
            value={{
                client: clientRef.current,
                clientSDKKey,
                enableStreaming,
                serverDataPromise,
            }}
        >
            <Suspense fallback={null}>
                <SynchronizeClientData
                    serverDataPromise={serverDataPromise}
                    client={clientRef.current}
                    skipInitialSync={skipInitialSync.current}
                />
            </Suspense>
            {children}
        </DevCycleProviderContext.Provider>
    )
}
