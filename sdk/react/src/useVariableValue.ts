import { useVariable } from './useVariable'
import {
    InferredVariableType,
    VariableDefinitions,
    VariableKey,
} from '@devcycle/types'

export const useVariableValue = <
    K extends VariableKey,
    DefaultValue extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: DefaultValue,
): InferredVariableType<K, DefaultValue> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
