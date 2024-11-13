'use client'
import React, { use, useRef } from 'react'
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
    promiseResolved: boolean
    children: React.ReactNode
}

const isServer = typeof window === 'undefined'

export const InternalDevCycleClientsideProvider = ({
    context,
    children,
    promiseResolved,
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

    let resolvedServerData = serverData

    if (!serverData && promiseResolved) {
        // here the provider is being told from above that this promise has already resolved, so we can safely "use"
        // it without blocking rendering, even in streaming mode
        resolvedServerData = use(serverDataPromise)
    }

    if (!clientRef.current) {
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

        if (resolvedServerData || !enableStreaming) {
            // we expect that either the promise has resolved and we got the server data that way, or we weren't in
            // streaming mode and so the promise was awaited at a higher level and passed in here as serverData
            if (!resolvedServerData) {
                throw new Error(
                    'Server data should be available. Please contact DevCycle support.',
                )
            }
            clientRef.current.synchronizeBootstrapData(
                resolvedServerData.config,
                resolvedServerData.user,
                resolvedServerData.userAgent,
            )
        } else if (typeof window !== 'undefined') {
            // if the promise isnt resolved yet, schedule it to synchronize when it is
            // we check the above condition first to make sure we can use the resolved data on the first render pass
            // since the `.then` here is only evaluated after this render pass is finished
            serverDataPromise.then((serverData) => {
                clientRef.current!.synchronizeBootstrapData(
                    serverData.config,
                    serverData.user,
                    serverData.userAgent,
                )
            })
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
            {children}
        </DevCycleProviderContext.Provider>
    )
}
