import { useVariable } from './'
import type { DVCVariableValue } from '@devcycle/devcycle-js-sdk'

export const useVariableValue = <T extends DVCVariableValue>(
    key: string, defaultValue: T
): ReturnType<typeof useVariable<T>>['value'] => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
