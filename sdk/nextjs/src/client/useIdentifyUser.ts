'use client'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { updateDVCCookie } from './updateDVCCookie'
import { useRouter } from 'next/navigation'
import { startTransition, useContext } from 'react'
import { DevCycleClientContext } from './DevCycleClientsideProvider'

/**
 * Hook that returns an identify function you can use to identify a user clientside.
 * Calling this will trigger a `router.refresh()` which allows server components to re-render with the new identity
 */
export const useIdentifyUser = (): ((user: DevCycleUser) => void) => {
    const context = useContext(DevCycleClientContext)
    const router = useRouter()

    if (!context.enableClientsideIdentify) {
        console.warn(
            'DevCycle clientside identity is disabled! useIdentifyUser will do nothing.',
        )
        return (_user: DevCycleUser) => {
            // no-op
        }
    }

    return (user: DevCycleUser) => {
        updateDVCCookie(context.client, user, true)
        startTransition(() => {
            router.refresh()
        })
    }
}
