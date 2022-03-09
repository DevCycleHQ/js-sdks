import { DVCVariable as Variable, DVCVariableValue } from './types'
import { checkParamDefined, checkParamType } from './utils'

type VariableParam = Pick<Variable, 'key' | 'defaultValue'> & {
    value?: DVCVariableValue
    evalReason?: any
}

export class DVCVariable implements Variable {
    key: string
    value: DVCVariableValue
    callback?: (value: DVCVariableValue) => void
    readonly defaultValue: DVCVariableValue
    readonly isDefaulted: boolean
    readonly evalReason: any

    constructor(variable: VariableParam) {
        const { key, defaultValue } = variable
        checkParamType('key', key, 'string')
        checkParamDefined('defaultValue', defaultValue)
        this.key = variable.key

        if (variable.value === undefined || variable.value === null) {
            this.isDefaulted = true
            this.value = variable.defaultValue
        } else {
            this.value = variable.value
            this.isDefaulted = false
        }

        this.defaultValue = variable.defaultValue
        this.evalReason = variable.evalReason
    }

    onUpdate(callback: (value: DVCVariableValue) => void): DVCVariable {
        checkParamType('callback', callback, 'function')
        this.callback = callback
        return this
    }
}
