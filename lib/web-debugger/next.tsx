import { useEffect } from 'react'
import {
    initializeDevCycleDebugger,
    DebuggerIframeOptions,
} from './src/initializeDevCycleDebugger'
import { useDevCycleClient, DevCycleJSClient } from '@devcycle/nextjs-sdk'

export const DevCycleDebugger = (options: DebuggerIframeOptions): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        // client here is typed as a DevCycleNextClient which is just a Typescript-omitted version of DevCycleClient
        // its still a DevCycleClient under the hood, we just want to expose it to Next.js users as having less methods
        const cleanupPromise = initializeDevCycleDebugger(
            client as DevCycleJSClient,
            {
                ...options,
                hasClientSideUser: false,
            },
        )
        return () => {
            cleanupPromise.then((cleanup) => cleanup())
        }
    }, [client])

    return null
}
