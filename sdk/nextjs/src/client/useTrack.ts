'use client'
import type { DevCycleEvent } from '@devcycle/js-client-sdk'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useCallback } from 'react'

export const useTrack = (): ((event: DevCycleEvent) => void) => {
    const client = useDevCycleClient()
    return useCallback(
        (event: DevCycleEvent) => {
            client.track(event)
        },
        [client],
    )
}
