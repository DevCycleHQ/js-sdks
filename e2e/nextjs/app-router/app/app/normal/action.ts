'use server'

import { getVariableValue } from './devcycle'

export const testAction = async () => {
    const result = await getVariableValue('enabled-feature', false)
    return result
}
