import 'server-only'
import { getDevCycleContext } from '@devcycle/next-sdk/server'
import React from 'react'
import { initializeDevCycle } from '@devcycle/js-client-sdk'
import { DevCycleClientProviderClientSide } from '../client/DevCycleClientProviderClientside'
import { dvcGlobal } from '../common/global'

type DevCycleClientProviderProps = {
    children: React.ReactNode
}

export const DevCycleClientProvider = async ({
    children,
}: DevCycleClientProviderProps) => {
    const context = await getDevCycleContext()
    if (!dvcGlobal.devcycleClient) {
        dvcGlobal.devcycleClient = initializeDevCycle(
            context.sdkKey,
            context.user!,
            {
                bootstrapConfig: context.config,
            },
        )
    }
    return (
        <>
            {/* this renders a client component that also sets the client on global*/}
            {/* context is passed to perform bootstrapping of the server's config on clientside */}
            <DevCycleClientProviderClientSide context={context} />
            {children}
        </>
    )
}
