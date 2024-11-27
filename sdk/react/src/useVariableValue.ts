import { useVariable } from './useVariable'
import type { DVCVariableValue, VariableKey } from '@devcycle/js-client-sdk'
import type { VariableTypeAlias } from '@devcycle/types'

export const useVariableValue = <T extends DVCVariableValue>(
    key: VariableKey,
    defaultValue: T,
): VariableTypeAlias<T> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
