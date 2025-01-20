export enum VariableSource {
    api = 'api',
    dashboard = 'dashboard',
    clientSDK = 'clientSDK',
    serverSDK = 'serverSDK',
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
    json = 'JSON',
}

/**
 * Supported variable values
 */

type JSONValue = string | number | boolean | null | JSONObject | JSONArray

type JSONObject = {
    [key: string]: JSONValue
}

type JSONArray = JSONValue[]

export type DVCJSON = JSONObject
export type DevCycleJSON = JSONObject

export type VariableValue = string | boolean | number | DVCJSON

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

// alias to resolve a generic type constrained by `VariableValue` back into its original type
export type VariableTypeAlias<T> = IsUnion<T> extends true
    ? T
    : T extends boolean
    ? boolean
    : T extends number
    ? number
    : T extends string
    ? string
    : T extends DVCJSON
    ? DVCJSON
    : never
