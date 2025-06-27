import { DVCVariable as Variable, DVCVariableValue } from './types'
import { checkParamDefined, checkParamType } from './utils'
import type { EvalReason, VariableTypeAlias } from '@devcycle/types'

export interface DVCVariableOptions<T> {
    key: string
    defaultValue: T
    value?: VariableTypeAlias<T>
    eval?: EvalReason
    _feature?: string
}

export class DVCVariable<T extends DVCVariableValue> implements Variable<T> {
    key: string
    // prevent more specific typing based on type of defaultValue
    value: VariableTypeAlias<T>
    callback?: (value: VariableTypeAlias<T>) => void
    readonly defaultValue: T
    isDefaulted: boolean
    readonly eval?: EvalReason
    readonly _feature?: string

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
        this.eval = variable.eval
        this._feature = variable._feature || undefined
    }

    onUpdate(callback: (value: VariableTypeAlias<T>) => void): DVCVariable<T> {
        checkParamType('callback', callback, 'function')
        this.callback = callback
        return this
    }
}
