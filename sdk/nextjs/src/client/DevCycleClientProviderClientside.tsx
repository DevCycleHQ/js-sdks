'use client'
import type { getDevCycleContext } from '@devcycle/next-sdk/server'
import React, { useEffect } from 'react'
import { initializeDevCycle } from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'
import { dvcGlobal } from '../common/global'

type DevCycleClientProviderProps = {
    context: Awaited<ReturnType<typeof getDevCycleContext>>
}

export const DevCycleClientProviderClientSide = ({
    context,
}: DevCycleClientProviderProps) => {
    const router = useRouter()

    if (!dvcGlobal.devcycleClient) {
        dvcGlobal.devcycleClient = initializeDevCycle(
            context.sdkKey,
            context.user!,
            {
                bootstrapConfig: context.config,
            },
        )
    }
    useEffect(() => {
        dvcGlobal.devcycleClient?.subscribe('configUpdated', () => {
            // trigger an in-place refetch of server components
            router.refresh()
        })
        return () => {
            dvcGlobal.devcycleClient?.unsubscribe('configUpdated')
        }
    }, [])
    return <></>
}
