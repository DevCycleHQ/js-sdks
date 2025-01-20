import { VariableTypeAlias, VariableValue } from './config/models'

/**
 * Used to support strong typing of variable keys in the SDK.
 * Usage;
 * ```ts
 * import '@devcycle/types';
 * declare module '@devcycle/types' {
 *   interface CustomVariableDefinitions {
 *     'flag-one': boolean;
 *   }
 * }
 * ```
 * Or when using the cli generated types;
 * ```ts
 * import '@devcycle/types';
 * declare module '@devcycle/types' {
 *   interface CustomVariableDefinitions extends DVCVariableTypes {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomVariableDefinitions {}
type DynamicBaseVariableDefinitions =
    keyof CustomVariableDefinitions extends never
        ? {
              [key: string]: VariableValue
          }
        : CustomVariableDefinitions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VariableDefinitions extends DynamicBaseVariableDefinitions {}
export type VariableKey = string & keyof VariableDefinitions

// type that determines whether the CustomVariableDefinitions interface has any keys defined, meaning
// that we're using custom variable types
export type CustomVariablesDefined =
    keyof CustomVariableDefinitions extends never ? false : true

// type helper which turns a default value type into the type defined in custom variable types, if those exist
// otherwise run it through VariableTypeAlias
export type InferredVariableType<
    K extends VariableKey,
    DefaultValue extends VariableDefinitions[K],
> = CustomVariablesDefined extends true
    ? VariableDefinitions[K]
    : VariableTypeAlias<DefaultValue>
