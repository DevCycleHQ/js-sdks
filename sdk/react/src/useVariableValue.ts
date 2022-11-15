import { useVariable } from './'
import type { DVCVariableValue } from '@devcycle/devcycle-js-sdk'
import { VariableTypeAlias } from '@devcycle/types'

export const useVariableValue = <T extends DVCVariableValue>(key: string, defaultValue: T): VariableTypeAlias<T> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue
