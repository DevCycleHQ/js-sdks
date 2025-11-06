import { useEffect } from 'react'
import {
    initializeDevCycleDebugger,
    DebuggerIframeOptions,
} from './src/initializeDevCycleDebugger.js'
import {
    useDevCycleClient,
    DevCycleJSClient,
    setDebugUser,
    removeDebugUser,
} from '@devcycle/nextjs-sdk'
import { DevCycleUser } from '@devcycle/js-client-sdk'

export const DevCycleDebugger = (options: DebuggerIframeOptions): null => {
    const client = useDevCycleClient()

    useEffect(() => {
        // client here is typed as a DevCycleNextClient which is just a Typescript-omitted version of DevCycleClient
        // its still a DevCycleClient under the hood, we just want to expose it to Next.js users as having less methods
        const cleanupPromise = initializeDevCycleDebugger(
            client as DevCycleJSClient,
            {
                ...options,
                onIdentifyUser: (user: DevCycleUser) => {
                    setDebugUser(user)
                },
                onRevertUser: (user: DevCycleUser) => {
                    removeDebugUser(user.user_id)
                },
            },
        )
        return () => {
            cleanupPromise.then((cleanup) => cleanup())
        }
    }, [client])

    return null
}
