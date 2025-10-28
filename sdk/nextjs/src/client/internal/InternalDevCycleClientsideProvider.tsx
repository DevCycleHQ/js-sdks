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
 * @param enableStreaming
 * @constructor
 */
const SynchronizeClientData = ({
    serverDataPromise,
    client,
    enableStreaming,
}: {
    serverDataPromise: Promise<DevCycleServerData>
    client: DevCycleClient
    enableStreaming: boolean
}) => {
    const serverData = use(serverDataPromise)
    const dataRef = useRef<DevCycleServerData | null>(
        // when streaming is disabled, we run synchronization on the initial server data in the
        // InternalDevCycleClientsideProvider component so we don't need to do it again immediately.
        // In streaming mode we want to synchronize on that initial server data since we aren't doing it above
        // Therefore set this ref to the initial server data so the below check won't run when not in streaming mode
        !enableStreaming ? serverData : null,
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
        clientRef.current = initializeDevCycle(clientSDKKey, {
            ...context.options,
            sdkPlatform: 'nextjs',
            deferInitialization: true,
            disableConfigCache: true,
            // ...(isServer
            //     ? {
            //           disableAutomaticEventLogging: true,
            //           disableCustomEventLogging: true,
            //       }
            //     : {}),
            next: {
                configRefreshHandler: revalidateConfig,
                disableAutomaticEventFlush: isServer ? true : false,
            },
        })

        if (!enableStreaming) {
            // we expect that in non-streaming mode, the serverside portion of this provider should have awaited
            // the serverDataPromise and passed in the result here
            if (!serverData) {
                throw new Error(
                    'Server data should be available. Please contact DevCycle support.',
                )
            }
            clientRef.current.synchronizeBootstrapData(
                serverData.config,
                serverData.user,
                serverData.userAgent,
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
                    enableStreaming={enableStreaming}
                />
            </Suspense>
            {children}
        </DevCycleProviderContext.Provider>
    )
}
