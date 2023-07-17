import { useContext, useRef, useState } from 'react'
import context from './context'
import type { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    const dvcContext = useContext(context)
    const [_, forceRerender] = useState({})
    const ref = useRef<DVCVariable<T>>()

    if (dvcContext === undefined)
        throw new Error('useVariable must be used within DevCycleProvider')

    if (!ref.current) {
        ref.current = dvcContext?.client.variable(key, defaultValue)
        ref.current.onUpdate(() => forceRerender({}))
    }

    return ref.current
}

export default useVariable
