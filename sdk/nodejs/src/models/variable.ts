import { VariableTypeAlias } from '@devcycle/types'
import { DVCVariable as DVCVariableInterface, DVCVariableValue, JSON } from '../types'
import { checkParamDefined, checkParamType, typeEnum } from '../utils/paramUtils'

export type VariableParam<T extends DVCVariableValue> = {
    key: string,
    defaultValue: T,
    value?: VariableTypeAlias<T>
    evalReason?: unknown
}

export class DVCVariable<T extends DVCVariableValue> implements DVCVariableInterface {
    key: string
    value: VariableTypeAlias<T>
    readonly defaultValue: T
    readonly isDefaulted: boolean
    readonly type?: 'String' | 'Number' | 'Boolean' | 'JSON'
    readonly evalReason?: unknown

    constructor(variable: VariableParam<T>) {
        const { key, defaultValue, value, evalReason } = variable
        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        checkParamType('key', key, typeEnum.string)
        this.key = key.toLowerCase()
        this.isDefaulted = (value === undefined || value === null)
        this.value = (value === undefined || value === null)
            ? defaultValue as unknown as VariableTypeAlias<T>
            : value
        this.defaultValue = defaultValue
        this.evalReason = evalReason
    }
}
