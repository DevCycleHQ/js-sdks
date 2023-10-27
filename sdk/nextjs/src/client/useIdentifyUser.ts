'use client'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { useDevCycleClient } from './useDevCycleClient'
import { updateDVCCookie } from './updateDVCCookie'
import { useRouter } from 'next/navigation'
import { startTransition } from 'react'

export const useIdentifyUser = () => {
    const client = useDevCycleClient()
    const router = useRouter()
    return (user: DevCycleUser) => {
        updateDVCCookie(client, user, true)
        startTransition(() => {
            router.refresh()
        })
    }
}
