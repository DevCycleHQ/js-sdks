import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator'
import ISO6391 from 'iso-639-1'

export const IS_ISO6391 = 'isISO6391'

/**
 * Check if the string is a valid [ISO 639-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
 * officially assigned country code.
 */
export function isISO6391(value: unknown): boolean {
    return typeof value === 'string' && isISO6391Validator(value)
}

/**
 * Check if the string is a valid [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) official code.
 */
export function IsISO6391(
    validationOptions?: ValidationOptions,
): PropertyDecorator {
    return ValidateBy(
        {
            name: IS_ISO6391,
            validator: {
                validate: (value, args): boolean => isISO6391(value),
                defaultMessage: buildMessage(
                    (eachPrefix) =>
                        eachPrefix + '$property must be a valid ISO6391 code',
                    validationOptions,
                ),
            },
        },
        validationOptions,
    )
}

export function isISO6391Validator(value: string): boolean {
    return ISO6391.validate(value.toLocaleLowerCase())
}
