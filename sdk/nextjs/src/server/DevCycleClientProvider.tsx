import 'server-only'
import {
    getClient,
    getDevCycleContext,
    identifyInitialUser,
    identifyUser,
    setClient,
    setSDKKey,
} from '@devcycle/next-sdk/server'
import React from 'react'
import { DevCycleUser, initializeDevCycle } from '@devcycle/js-client-sdk'
import { DevCycleClientProviderClientSide } from '../client/DevCycleClientProviderClientside'
import { getDVCCookie } from './cookie'

type DevCycleServerOptions = {
    initialUserOnly?: boolean
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
    { initialUserOnly = true }: DevCycleServerOptions = {},
) => {
    setSDKKey(sdkKey)
    if (initialUserOnly) {
        await identifyInitialUser(user)
    } else {
        await identifyUser(user)
    }

    const context = await getDevCycleContext()

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
    setSDKKey(sdkKey)
    const context = await initialize(sdkKey, user, options)
    const { populatedUser, ...clientContext } = context

    // this renders a client component that also sets the client on global
    // context is passed to perform bootstrapping of the server's config on clientside
    return (
        <DevCycleClientProviderClientSide context={clientContext}>
            {children}
        </DevCycleClientProviderClientSide>
    )
}
