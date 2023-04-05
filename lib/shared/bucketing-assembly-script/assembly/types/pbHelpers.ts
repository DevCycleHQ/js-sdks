import { VariableType_PB } from './protobuf-generated/VariableType_PB'

export enum VariableType {
    Boolean,
    Number,
    String,
    JSON
}
export const VariableTypeStrings = ['Boolean', 'Number', 'String', 'JSON']

/**
 * Convert PB VariableType to SDK VariableType
 * @param pbVariableType
 */
export function variableTypeFromPB(pbVariableType: VariableType_PB): VariableType {
    switch (pbVariableType) {
        case VariableType_PB.Boolean: return VariableType.Boolean
        case VariableType_PB.Number: return VariableType.Number
        case VariableType_PB.String: return VariableType.String
        case VariableType_PB.JSON: return VariableType.JSON
        default: throw new Error(`Unknown variable type: ${pbVariableType}`)
    }
}
