import 'server-only'
import React from 'react'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { DevCycleClientsideProvider } from '../client/DevCycleClientsideProvider'
import { getSDKKey, setInitializedPromise } from './requestContext'
import { DevCycleNextOptions, initialize } from './initialize'
import { getUserIdentity } from './identify'

export type DevCycleServersideProviderProps = {
    sdkKey: string
    // server-side users must always be "identified" with a user id
    user: Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & { user_id: string }
    invalidateConfig?: (sdkKey: string, time?: number) => Promise<void>
    options?: DevCycleNextOptions
    children: React.ReactNode
}

export const DevCycleServersideProvider = async ({
    children,
    sdkKey,
    user,
    invalidateConfig,
    options,
}: DevCycleServersideProviderProps): Promise<React.ReactElement> => {
    const serverDataPromise = initialize(sdkKey, user, options)
    setInitializedPromise(serverDataPromise)

    if (!options?.enableStreaming) {
        await serverDataPromise
    }

    const identifiedUser = getUserIdentity()

    if (!identifiedUser) {
        throw new Error(
            "React 'cache' function not working as expected. Please contact DevCycle support.",
        )
    }

    // this renders a client component that provides an instance of DevCycle client to client components via context
    // server data is passed to perform bootstrapping of the server's config on clientside

    return (
        <DevCycleClientsideProvider
            serverDataPromise={serverDataPromise}
            user={identifiedUser}
            invalidateConfig={invalidateConfig}
            sdkKey={getSDKKey()}
            enableStreaming={options?.enableStreaming ?? false}
        >
            {children}
        </DevCycleClientsideProvider>
    )
}
