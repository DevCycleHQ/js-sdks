import { isString, isNumber, isBoolean, isPlainObject, isNull, isUndefined } from 'lodash'
import { registerDecorator, ValidationOptions } from 'class-validator'

export type DVCJSON = { [key: string]: string | number | boolean }

/**
 * Validates that JSON Object is a valid JSON Object with only
 * top-level string / number / boolean values.
 */
export function IsDVCJSONObject(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function(object: Object, propertyName: string): void {
        registerDecorator({
            name: 'isLongerThan',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate,
                defaultMessage() {
                    return '$property must be a JSON Object with only string / number / boolean types'
                }
            }
        })
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function validate(json: any): boolean {
    if (!isPlainObject(json)) return false

    for (const key in json) {
        if (!isString(key)) return false

        const value = json[key]
        if (isUndefined(value) || isNull(value) || !(isString(value) || isNumber(value) || isBoolean(value))) {
            return false
        }
    }
    return true
}
