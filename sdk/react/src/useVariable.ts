import { useContext, useState } from 'react'
import context from './context'
import type { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariable = <T extends DVCVariableValue>(key: string, defaultValue: T): DVCVariable<T> => {
    const dvcContext = useContext(context)
    const [_, forceRerender] = useState({})

    if (dvcContext === undefined) throw new Error('useVariable must be used within DVCProvider')

    return dvcContext.client.variable(key, defaultValue).onUpdate(() => forceRerender({}))
}

export default useVariable
