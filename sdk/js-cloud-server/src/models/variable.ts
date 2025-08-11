import {
    EvalReason,
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
    /**
     * @deprecated use eval instead
     */
    evalReason?: unknown
    eval?: EvalReason
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
    /**
     * @deprecated use eval instead
     */
    readonly evalReason?: unknown
    readonly eval?: EvalReason

    constructor(variable: VariableParam<T>) {
        const { key, defaultValue, value, eval: evalReason, type } = variable
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
        this.eval = evalReason
        this.type = type
    }
}

export class VariableMetadata {
    constructor(public featureId?: string | null) {}
}

export class VariableWithMetadata<T extends DVCVariableValue> {
    variable: DVCVariable<T>
    metadata: VariableMetadata

    constructor(variableParams: VariableParam<T>, featureId?: string) {
        this.variable = new DVCVariable<T>(variableParams)
        this.metadata = new VariableMetadata(featureId)
    }
}
