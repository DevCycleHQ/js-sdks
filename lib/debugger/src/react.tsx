import { useEffect } from 'react'
import { createIframe, DebuggerIframeOptions } from './createIframe'
import { useDevCycleClient } from '@devcycle/react-client-sdk'

export const DevCycleDebugger = ({
    debuggerUrl,
    position,
}: DebuggerIframeOptions): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        return createIframe(client, {
            debuggerUrl,
            position,
        })
    }, [client])

    return null
}
