import {
    InferredVariableType,
    VariableKey,
    VariableType,
    VariableTypeAlias,
} from '@devcycle/types'
import { DVCVariableInterface, DVCVariableValue } from '../types'
import {
    checkParamDefined,
    checkParamType,
    typeEnum,
} from '../utils/paramUtils'

export type VariableParam<T extends DVCVariableValue> = {
    key: string
    defaultValue: T
    value?: VariableTypeAlias<T>
    type: VariableType
    evalReason?: unknown
}

export class DVCVariable<
    T extends DVCVariableValue,
    K extends VariableKey = VariableKey,
> implements DVCVariableInterface
{
    key: K
    value: InferredVariableType<K, T>
    readonly defaultValue: T
    readonly isDefaulted: boolean
    readonly type: 'String' | 'Number' | 'Boolean' | 'JSON'
    readonly evalReason?: unknown

    constructor(variable: VariableParam<T>) {
        const { key, defaultValue, value, evalReason, type } = variable
        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        checkParamType('key', key, typeEnum.string)
        // kind of cheating here with the type assertion but we're basically assuming that all variable keys in
        // generated types are lowercase since the system enforces that elsewhere
        this.key = key.toLowerCase() as K
        this.isDefaulted = value === undefined || value === null
        this.value =
            value === undefined || value === null
                ? (defaultValue as unknown as VariableTypeAlias<T>)
                : value
        this.defaultValue = defaultValue
        this.evalReason = evalReason
        this.type = type
    }
}
