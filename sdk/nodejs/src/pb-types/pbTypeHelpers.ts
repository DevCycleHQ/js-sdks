import { SDKVariable, VariableType, VariableValue } from '@devcycle/types'
import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'

type GetVariableType = {
    type: VariableType
    value: VariableValue
}
function getVariableTypeFromPB(
    variable: ProtobufTypes.SDKVariable_PB,
): GetVariableType {
    switch (variable.type) {
        case ProtobufTypes.VariableType_PB.Boolean:
            return {
                type: VariableType.boolean,
                value: variable.boolValue,
            }
        case ProtobufTypes.VariableType_PB.Number:
            return {
                type: VariableType.number,
                value: variable.doubleValue,
            }
        case ProtobufTypes.VariableType_PB.String:
            return {
                type: VariableType.string,
                value: variable.stringValue,
            }
        case ProtobufTypes.VariableType_PB.JSON:
            return {
                type: VariableType.json,
                value: JSON.parse(variable.stringValue),
            }
        default:
            throw new Error(`Unknown variable type: ${variable.type}`)
    }
}

export function pbSDKVariableTransform(
    variable: ProtobufTypes.SDKVariable_PB,
): SDKVariable {
    const { type, value } = getVariableTypeFromPB(variable)

    return {
        _id: variable._id,
        type,
        key: variable.key,
        value,
        evalReason:
            !variable.evalReason || variable.evalReason.isNull
                ? null
                : variable.evalReason,
        featureId:
            !variable._feature || variable._feature.isNull
                ? null
                : variable._feature.value,
        eval: variable.eval,
    }
}
