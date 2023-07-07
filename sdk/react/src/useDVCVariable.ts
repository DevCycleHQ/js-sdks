import type { DVCVariable, DVCVariableValue } from '@devcycle/js-client-sdk'
import useVariable from './useVariable'

/**
 *
 * @deprecated Use the `useVariable` hook instead
 *
 */
export const useDVCVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    return useVariable(key, defaultValue)
}

export default useDVCVariable
