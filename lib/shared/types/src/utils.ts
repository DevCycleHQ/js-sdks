// Type to retrieve the element type from an array
// eg. ArrayElement<string[]> -> string
import { VariableType, VariableValue } from './types/config/models'
import { DVCLogger } from './logger'

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export function getVariableTypeFromValue(
  value: VariableValue,
  key: string,
  logger: DVCLogger,
  shouldThrow?: false,
): VariableType | null

export function getVariableTypeFromValue(
  value: VariableValue,
  key: string,
  logger: DVCLogger,
  shouldThrow: true,
): VariableType

export function getVariableTypeFromValue(
  value: VariableValue,
  key: string,
  logger: DVCLogger,
  shouldThrow?: boolean,
): VariableType | null {
  if (typeof value === 'boolean') {
    return VariableType.boolean
  } else if (typeof value === 'number') {
    return VariableType.number
  } else if (typeof value === 'string') {
    return VariableType.string
  } else if (typeof value === 'object') {
    return VariableType.json
  } else {
    if (shouldThrow) {
      throw new Error(
        `The default value for variable ${key} is not of type Boolean, Number, String, or JSON`,
      )
    } else {
      logger.warn(
        `The default value for variable ${key} is not of type Boolean, Number, String, or JSON`,
      )
      return null
    }
  }
}
