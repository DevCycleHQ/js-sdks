import { useEffect } from 'react'
import { createIframe, DebuggerIframeOptions } from './createIframe'
import { useDevCycleClient } from '@devcycle/react-client-sdk'

export const DevCycleDebugger = (options: DebuggerIframeOptions): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        const cleanupPromise = createIframe(client, options)
        return () => {
            cleanupPromise.then((cleanup) => cleanup())
        }
    }, [client])

    return null
}
