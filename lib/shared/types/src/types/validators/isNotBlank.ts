import { registerDecorator, ValidationOptions } from '@nestjs/class-validator'

/**
 * Validates that string is not filled with spaces
 */
export function IsNotBlank(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function(object: Object, propertyName: string): void {
        registerDecorator({
            name: 'isNotBlank',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate
            }
        })
    }
}

export function validate(value: unknown): boolean {
    return typeof value === 'string' && value.trim().length > 0
}
