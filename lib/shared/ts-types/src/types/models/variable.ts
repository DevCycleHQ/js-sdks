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
export type VariableValue = string | boolean | number | JSON
type JSON = { [key: string]: string | boolean | number }
