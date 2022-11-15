export enum VariableSource {
    api = 'api',
    dashboard = 'dashboard',
    clientSDK = 'clientSDK',
    serverSDK = 'serverSDK'
}

/**
 * Variable model, defines the project-level variables used in SDKs to change functionality.
 */
export class Variable<IdType = string> {
    /**
     * Mongo primary _id.
     */
    _id: IdType

    /**
     * Variable schema type
     */
    type: VariableType

    /**
     * Unique key by Project. Used in the SDKs as the main reference for variables.
     * Must only contain lower-case characters and `_` or `-`.
     */
    key: string
}

/**
 * Supported variable types
 */
export enum VariableType {
    string = 'String',
    boolean = 'Boolean',
    number = 'Number',
    object = 'JSON'
}

/**
 * Supported variable values
 */
export type DVCJSON = { [key: string]: string | boolean | number }
export type VariableValue = string | boolean | number | DVCJSON

// alias to resolve a generic type constrained by `VariableValue` back into its original type
export type VariableTypeAlias<T> = T extends boolean ? boolean : (
        T extends number ? number : (
            T extends string ? string : (
                T extends DVCJSON ? DVCJSON : never
                )
            )
        )
