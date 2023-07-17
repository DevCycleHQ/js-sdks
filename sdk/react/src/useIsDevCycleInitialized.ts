import { useContext, useState } from 'react'
import context from './context'

export const useIsDevCycleInitialized = (): boolean => {
    const [isDVCReady, setIsDVCReady] = useState(false)
    const dvcContext = useContext(context)

    if (dvcContext === undefined)
        throw new Error(
            'useIsDevCycleInitialized must be used within DevCycleProvider',
        )

    if (isDVCReady) return isDVCReady

    dvcContext.client
        .onClientInitialized()
        .then(() => {
            setIsDVCReady(true)
        })
        .catch(() => {
            // set to true to unblock app load
            console.log('Error initializing DevCycle.')
            setIsDVCReady(true)
        })

    return isDVCReady
}

/**
 * @deprecated use useIsDevCycleInitialized instead
 */
export const useIsDVCInitialized = useIsDevCycleInitialized
