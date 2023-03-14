import { SDKVariable_PB, VariableType_PB } from './compiled'
import { SDKVariable, VariableType, VariableValue } from '@devcycle/types'

type GetVariableType = {
    type: VariableType,
    value: VariableValue
}
function getVariableTypeFromPB(variable: SDKVariable_PB): GetVariableType {
    switch (variable.type) {
        case VariableType_PB.Boolean:
            return {
                type: VariableType.boolean,
                value: variable.boolValue
            }
        case VariableType_PB.Number:
            return {
                type: VariableType.number,
                value: variable.doubleValue
            }
        case VariableType_PB.String:
            return {
                type: VariableType.string,
                value: variable.stringValue
            }
        case VariableType_PB.JSON:
            return {
                type: VariableType.json,
                value: JSON.stringify(variable.stringValue)
            }
        default:
            throw new Error(`Unknown variable type: ${variable.type}`)
    }
}

export function pbSDKVariableTransform(variable: SDKVariable_PB): SDKVariable {
    const { type, value } = getVariableTypeFromPB(variable)

    return {
        _id: variable._id,
        type,
        key: variable.key,
        value,
        evalReason: (!variable.evalReason || variable.evalReason.isNull)
            ? null
            : variable.evalReason,
    }
}
