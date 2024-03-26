import { useDevCycleClient } from '@devcycle/react-client-sdk'
import { useEffect } from 'react'
import { createIframe } from '@devcycle/debugger'

export const Iframe = () => {
    const client = useDevCycleClient()

    useEffect(() => {
        return createIframe(client, 'http://localhost:4201')
    }, [client])

    return null
}
