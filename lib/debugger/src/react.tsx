import { useEffect } from 'react'
import { createIframe } from './createIframe'
import { useDevCycleClient } from '@devcycle/react-client-sdk'

export const DevCycleDebugger = ({
    debuggerUrl,
}: {
    debuggerUrl?: string
}): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        return createIframe(client, debuggerUrl)
    }, [client])

    return null
}
