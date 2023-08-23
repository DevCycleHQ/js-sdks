import { useContext } from 'react'
import { initializedContext } from './context'

export const useIsDevCycleInitialized = (): boolean => {
    const context = useContext(initializedContext)
    if (context === undefined)
        throw new Error(
            'useIsDevCycleInitialized must be used within DevCycleProvider',
        )

    return context.isInitialized
}

/**
 * @deprecated use useIsDevCycleInitialized instead
 */
export const useIsDVCInitialized = useIsDevCycleInitialized
