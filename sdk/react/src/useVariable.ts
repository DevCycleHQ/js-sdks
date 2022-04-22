import { useContext } from 'react'
import context from './context'
import type { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariable = (key: string, defaultValue: DVCVariableValue): DVCVariable => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined) throw new Error('useVariable must be used within DVCProvider')

    return dvcContext.client ? dvcContext.client.variable(key, defaultValue) : {
        value: defaultValue,
        defaultValue: defaultValue,
        isDefaulted: true,
        // TODO fix this when variable hook rerendering is finished
        onUpdate: (() => {
            // no-op
        }) as () => DVCVariable,
        key
    }
}

export default useVariable
