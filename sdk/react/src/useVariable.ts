import { useContext, useRef, useState } from 'react'
import context from './context'
import type { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'
import { VariableDefinitions } from '@devcycle/devcycle-js-sdk'

export const useVariable = <Variables extends VariableDefinitions = VariableDefinitions,
    K extends string & keyof Variables = string & keyof Variables,
    T extends DVCVariableValue & Variables[K] = DVCVariableValue & Variables[K]
>(key: K, defaultValue: T): DVCVariable<T> => {
    const dvcContext = useContext(context)
    const [_, forceRerender] = useState({})
    const ref = useRef<DVCVariable<T>>()

    if (dvcContext === undefined) throw new Error('useVariable must be used within DVCProvider')

    if (!ref.current) {
        ref.current = dvcContext?.client.variable(key, defaultValue)
        ref.current.onUpdate(() => forceRerender({}))
    }

    return ref.current
}

export default useVariable
