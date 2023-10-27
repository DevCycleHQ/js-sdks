import 'server-only'
import React, { ReactNode, Suspense } from 'react'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { DevCycleClientsideProvider } from '../client/DevCycleClientsideProvider'
import { getIdentity, getSDKKey, setInitializedPromise } from './requestContext'
import { DevCycleNextOptions, initialize } from './initialize'
import { any } from 'async'
import { fallbackConfig } from '../common/fallbackConfig'
import { getUserIdentity } from './identify'

export type DevCycleServersideProviderProps = {
    sdkKey: string
    user: DevCycleUser
    options?: DevCycleNextOptions
    children: React.ReactNode
}

export const DevCycleServersideProvider = async ({
    children,
    sdkKey,
    user,
    options,
}: DevCycleServersideProviderProps) => {
    const serverDataPromise = initialize(sdkKey, user, options)
    setInitializedPromise(serverDataPromise)

    if (!options?.enableStreaming) {
        await serverDataPromise
        // return (
        //     <BlockingClientProvider initializePromise={serverDataPromise}>
        //         {children}
        //     </BlockingClientProvider>
        // )
    }

    // this renders a client component that provides an instance of DevCycle client to client components via context
    // server data is passed to perform bootstrapping of the server's config on clientside

    const clientPromise = (async () => {
        const serverData = await serverDataPromise
        const { populatedUser, ...clientData } = serverData
        return clientData
    })()

    return (
        // <Suspense
        //     fallback={
        //         <DevCycleClientsideProvider
        //             serverData={{
        //                 // TODO update the SDK to accept "deferred bootstrapping"
        //                 config: fallbackConfig,
        //                 sdkKey: getSDKKey(),
        //                 user: getIdentity()!,
        //                 events: [],
        //                 options,
        //             }}
        //         >
        //             {children}
        //         </DevCycleClientsideProvider>
        //     }
        // >
        //     <BlockingClientProvider initializePromise={serverDataPromise}>
        //         {children}
        //     </BlockingClientProvider>
        // </Suspense>

        <DevCycleClientsideProvider
            serverDataPromise={clientPromise}
            user={getUserIdentity()!}
            sdkKey={getSDKKey()}
            enableStreaming={options?.enableStreaming ?? false}
        >
            {children}
        </DevCycleClientsideProvider>
    )
}

// const BlockingClientProvider = async ({
//     initializePromise,
//     children,
// }: {
//     initializePromise: ReturnType<typeof initialize>
//     children: ReactNode
// }) => {
//     const { populatedUser, ...serverDataForClient } = await initializePromise
//
//     return (
//         <DevCycleClientsideProvider serverData={serverDataForClient}>
//             {children}
//         </DevCycleClientsideProvider>
//     )
// }
