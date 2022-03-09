import type { DVCVariable } from '@devcycle/devcycle-js-sdk'
import useVariable from './useVariable'

/**
 *
 * @deprecated Use the `useVariable` hook instead
 *
 */
export const useDVCVariable = (key: string, defaultValue: any): DVCVariable => {
    return useVariable(key, defaultValue)
}

export default useDVCVariable
