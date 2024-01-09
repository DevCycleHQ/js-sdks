import { useVariable } from './useVariable'
import type { DVCVariableValue } from '@devcycle/js-client-sdk'
import type { VariableTypeAlias } from '@devcycle/types'

export const useVariableValue = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): VariableTypeAlias<T> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
