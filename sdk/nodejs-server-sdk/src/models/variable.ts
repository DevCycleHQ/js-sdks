import { DVCVariable as DVCVariableInterface, DVCVariableValue } from '../../types'
import { checkParamDefined, checkParamType, typeEnum } from '../utils/paramUtils'

type VariableParam = Pick<DVCVariableInterface, 'key' | 'defaultValue'> & {
    value?: DVCVariableValue
    evalReason?: unknown
}

export class DVCVariable implements DVCVariableInterface {
    key: string
    value: DVCVariableValue
    readonly defaultValue: DVCVariableValue
    readonly isDefaulted: boolean
    readonly type?: 'String' | 'Number' | 'Boolean' | 'JSON'
    readonly evalReason?: unknown

    constructor(variable: VariableParam) {
        const { key, defaultValue, value, evalReason } = variable
        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        checkParamType('key', key, typeEnum.string)
        this.key = key
        this.isDefaulted = (value === undefined || value === null)
        this.value = (value === undefined || value === null)
            ? defaultValue
            : value
        this.defaultValue = defaultValue
        this.evalReason = evalReason
    }
}
