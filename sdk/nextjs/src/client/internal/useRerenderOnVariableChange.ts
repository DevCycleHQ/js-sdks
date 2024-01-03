import { useCallback, useEffect, useState } from 'react'
import { useDevCycleClient } from './useDevCycleClient'

export const useRerenderOnVariableChange = (key?: string): void => {
    const [_, forceRerender] = useState({})
    const forceRerenderCallback = useCallback(() => forceRerender({}), [])
    const client = useDevCycleClient()

    const variableKey = key ?? '*'

    useEffect(() => {
        client.subscribe(
            `variableUpdated:${variableKey}`,
            forceRerenderCallback,
        )
        return () => {
            client.unsubscribe(
                `variableUpdated:${variableKey}`,
                forceRerenderCallback,
            )
        }
    }, [variableKey, client, forceRerenderCallback])
}
