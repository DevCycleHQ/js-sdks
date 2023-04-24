import { useVariable } from './'
import type { DVCVariable, DVCVariableValue, VariableDefinitions } from '@devcycle/devcycle-js-sdk'

export const useVariableValue = <Variables extends VariableDefinitions = VariableDefinitions,
    K extends string & keyof Variables = string & keyof Variables,
    T extends DVCVariableValue & Variables[K] = DVCVariableValue & Variables[K]
>(key: K, defaultValue: T): DVCVariable<T>['value'] => {
    return useVariable<Variables, K, T>(key, defaultValue).value
}

export default useVariableValue
