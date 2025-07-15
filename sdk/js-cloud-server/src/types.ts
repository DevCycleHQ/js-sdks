import { DVCCustomDataJSON, VariableValue, DVCJSON } from '@devcycle/types'

export type DVCVariableValue = VariableValue
export type JSON = DVCJSON
export type { DVCJSON, DVCCustomDataJSON }

export type DVCVariableSet = Record<
    string,
    Omit<DVCVariableInterface, 'defaultValue' | 'isDefaulted'> & { _id: string }
>

export interface DVCVariableInterface {
    /**
     * Unique "key" by Project to use for this Dynamic Variable.
     */
    readonly key: string

    /**
     * The value for this Dynamic Variable which will be set to the `defaultValue`
     * if accessed before the SDK is fully Initialized
     */
    readonly value: DVCVariableValue

    /**
     * Default value set when creating the variable
     */
    readonly defaultValue: DVCVariableValue

    /**
     * If the `variable.value` is set to use the `defaultValue` this will be `true`.
     */
    readonly isDefaulted: boolean

    /**
     * The data type of this Dynamic variable, which will be one of:
     * String, Number, Boolean, JSON
     */
    readonly type?: 'String' | 'Number' | 'Boolean' | 'JSON'

    /**
     * @deprecated use eval instead
     */
    readonly evalReason?: unknown
    /**
     * Evaluation Reason as to why the variable was segmented into a specific Feature and
     * given this specific value
     */
    readonly eval?: unknown
}

export interface DevCycleEvent {
    /**
     * type of the event
     */
    type: string

    /**
     * date event occurred according to client stored as time since epoch
     */
    date?: number

    /**
     * target / subject of event. Contextual to event type
     */
    target?: string

    /**
     * value for numerical events. Contextual to event type
     */
    value?: number

    /**
     * extra metadata for event. Contextual to event type
     */
    metaData?: Record<string, unknown>
}

export interface DVCFeature {
    readonly _id: string

    readonly _variation: string
    readonly variationKey: string
    readonly variationName: string

    readonly key: string

    readonly type: string

    /**
     * @deprecated use eval instead
     */
    readonly evalReason?: unknown
    readonly eval?: unknown
}

export type DVCFeatureSet = Record<string, DVCFeature>
