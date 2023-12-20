import 'server-only'
import React from 'react'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { DevCycleClientsideProvider } from '../client/DevCycleClientsideProvider'
import {
    cacheStorageError,
    getSDKKey,
    setInitializedPromise,
} from './requestContext'
import { DevCycleNextOptions, initialize, setupContext } from './initialize'
import { getUserIdentity } from './identify'

import { cache, use } from 'react'

console.log(cache, use)

export type DevCycleServersideProviderProps = {
    sdkKey: string
    // server-side users must always be "identified" with a user id
    user: Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & { user_id: string }
    options?: DevCycleNextOptions
    children: React.ReactNode
}

export const DevCycleServersideProvider = async ({
    children,
    sdkKey,
    user,
    options,
}: DevCycleServersideProviderProps): Promise<React.ReactElement> => {
    setupContext(sdkKey, user, options)
    const serverDataPromise = initialize()
    setInitializedPromise(serverDataPromise)

    const identifiedUser = getUserIdentity()

    if (!identifiedUser) {
        throw cacheStorageError()
    }

    // this renders a client component that provides an instance of DevCycle client to client components via context
    // server data is passed to perform bootstrapping of the server's config on clientside

    return (
        <DevCycleClientsideProvider
            serverDataPromise={serverDataPromise}
            serverData={
                // options?.enableStreaming ? undefined : await serverDataPromise
                await serverDataPromise
            }
            user={identifiedUser}
            sdkKey={getSDKKey()}
            // enableStreaming={options?.enableStreaming ?? false}
            enableStreaming={false}
        >
            {children}
        </DevCycleClientsideProvider>
    )
}
