import { DVCVariable as Variable, DVCVariableValue, DVCJSON } from './types'
import { checkParamDefined, checkParamType } from './utils'
import { VariableTypeAlias } from '@devcycle/types'

export interface DVCVariableOptions<T> {
    key: string,
    defaultValue: T,
    value?: VariableTypeAlias<T>,
    evalReason?: any,
}

export class DVCVariable<T extends DVCVariableValue> implements Variable<T> {
    key: string
    // prevent more specific typing based on type of defaultValue
    value: VariableTypeAlias<T>
    callback?: (value: T) => void
    readonly defaultValue: T
    isDefaulted: boolean
    readonly evalReason: any

    constructor(variable: DVCVariableOptions<T>) {
        const { key, defaultValue } = variable
        checkParamType('key', key, 'string')
        checkParamDefined('defaultValue', defaultValue)
        this.key = key.toLowerCase()

        if (variable.value === undefined || variable.value === null) {
            this.isDefaulted = true
            this.value = defaultValue as unknown as VariableTypeAlias<T>
        } else {
            this.value = variable.value
            this.isDefaulted = false
        }

        this.defaultValue = variable.defaultValue
        this.evalReason = variable.evalReason
    }

    onUpdate(callback: (value: T) => void): DVCVariable<T> {
        checkParamType('callback', callback, 'function')
        this.callback = callback
        return this
    }
}
