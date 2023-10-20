'use client'
import type { getDevCycleContext } from '@devcycle/next-sdk/server'
import React from 'react'
import { initializeDevCycle } from '@devcycle/js-client-sdk'

type DevCycleClientProviderProps = {
    context: Awaited<ReturnType<typeof getDevCycleContext>>
}

export const clientGlobal = globalThis as any

export const DevCycleClientProviderClientSide = ({
    context,
}: DevCycleClientProviderProps) => {
    if (!clientGlobal.devcycleClient) {
        clientGlobal.devcycleClient = initializeDevCycle(
            context.sdkKey,
            context.user!,
            {
                bootstrapConfig: context.config,
            },
        )
    }
    return <></>
}
