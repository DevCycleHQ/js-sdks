'use client'
import type { DevCycleEvent } from '@devcycle/js-client-sdk'
import { useDevCycleClient } from './internal/useDevCycleClient'

export const useTrack = (): ((event: DevCycleEvent) => void) => {
    const client = useDevCycleClient()
    return (event: DevCycleEvent) => {
        client.track(event)
    }
}
