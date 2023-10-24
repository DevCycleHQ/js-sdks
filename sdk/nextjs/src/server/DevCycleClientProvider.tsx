import 'server-only'
import React from 'react'
import { DevCycleUser, initializeDevCycle } from '@devcycle/js-client-sdk'
import { DevCycleClientProviderClientSide } from '../client/DevCycleClientProviderClientside'
import { getClient, setClient, setSDKKey } from './requestContext'
import { identifyInitialUser, identifyUser } from './identify'
import { getDevCycleServerData } from './devcycleServerData'

type DevCycleServerOptions = {
    /**
     * Option to enable the ability to identify a user clientside. This allows `identifyUser` to be called in a client
     * component and synchronizes the user data via a cookie. The method will only work if cookie support is enabled
     * on the browser.
     */
    enableClientsideIdentify?: boolean
}

type DevCycleClientProviderProps = {
    sdkKey: string
    user: DevCycleUser
    options?: DevCycleServerOptions
    children: React.ReactNode
}

export const initialize = async (
    sdkKey: string,
    user: DevCycleUser,
    { enableClientsideIdentify = true }: DevCycleServerOptions = {},
) => {
    setSDKKey(sdkKey)
    if (enableClientsideIdentify) {
        await identifyInitialUser(user)
    } else {
        await identifyUser(user)
    }

    const context = await getDevCycleServerData()

    let client = getClient()
    if (!client) {
        setClient(
            initializeDevCycle(sdkKey, user, {
                bootstrapConfig: context.config,
            }),
        )
    } else {
        client.user = context.populatedUser
    }

    return context
}

export const DevCycleClientProvider = async ({
    children,
    sdkKey,
    user,
    options,
}: DevCycleClientProviderProps) => {
    const serverData = await initialize(sdkKey, user, options)
    const { populatedUser, ...serverDataForClient } = serverData

    // this renders a client component that also sets the client on global
    // context is passed to perform bootstrapping of the server's config on clientside
    return (
        <DevCycleClientProviderClientSide serverData={serverDataForClient}>
            {children}
        </DevCycleClientProviderClientSide>
    )
}
