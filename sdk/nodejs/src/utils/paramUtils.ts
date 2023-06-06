export const checkParamDefined = (name: string, param: unknown): unknown => {
  if (param === undefined || param === null) {
    throw new Error(`Missing parameter: ${name}`)
  }
  return param
}

export enum typeEnum {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
}
const typeEnumValues = Object.values(typeEnum)

export const checkParamType = (
  name: string,
  param: unknown,
  type: typeEnum,
): void => {
  if (param === undefined || param === null) {
    throw new Error(`${name} is invalid!`)
  }
  if (!typeEnumValues.includes(type)) {
    throw new Error(`unknown type to check: ${type}`)
  }
  if (typeof param !== type) {
    throw new Error(`${name} is not of type: ${type}`)
  }
  if (type === typeEnum.string && !(param as string).length) {
    throw new Error(`${name} is invalid string!`)
  }
  if (type === typeEnum.number && isNaN(param as number)) {
    throw new Error(`${name} is invalid number!`)
  }
}

export function checkParamString(name: string, param: unknown): string {
  checkParamType(name, param, typeEnum.string)
  return param as string
}

export function isValidServerSDKKey(sdkKey: string): boolean {
  return sdkKey?.startsWith('server') || sdkKey?.startsWith('dvc_server')
}
