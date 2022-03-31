import { useVariable } from './'
import context from './context'
import type { DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariableValue = (key: string, defaultValue: DVCVariableValue): DVCVariableValue => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
