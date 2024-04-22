import { useEffect } from 'react'
import {
    initializeDevCycleDebugger,
    DebuggerIframeOptions,
} from './initializeDevCycleDebugger'
import { useDevCycleClient } from '@devcycle/react-client-sdk'

export const DevCycleDebugger = (options: DebuggerIframeOptions): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        const cleanupPromise = initializeDevCycleDebugger(client, options)
        return () => {
            cleanupPromise.then((cleanup) => cleanup())
        }
    }, [client])

    return null
}
