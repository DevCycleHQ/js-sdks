import type { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'
import useVariable from './useVariable'

/**
 *
 * @deprecated Use the `useVariable` hook instead
 *
 */
export const useDVCVariable = (key: string, defaultValue: DVCVariableValue): DVCVariable => {
    return useVariable(key, defaultValue)
}

export default useDVCVariable
