import { useContext } from 'react'
import context from './context'
import type { DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariableValue = (key: string, defaultValue: DVCVariableValue): DVCVariableValue => {
    const { client } = useContext(context)
    if (client) {
        return client.variable(key, defaultValue).value
    } else {
        return defaultValue
    }
}

export default useVariableValue
