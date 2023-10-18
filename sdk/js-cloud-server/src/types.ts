import {
    DVCLogger,
    DVCDefaultLogLevel,
    DVCReporter,
    DVCCustomDataJSON,
    VariableValue,
    DVCJSON,
} from '@devcycle/types'

/**
 * Options to control the setup of the DevCycle NodeJS Server SDK.
 */
export interface DevCycleOptions {
    /**
     * Logger override to replace default logger
     */
    logger?: DVCLogger

    /**
     * Metrics reporter to capture data about event processing
     */
    reporter?: DVCReporter

    /**
     * Set log level of the default logger
     */
    logLevel?: DVCDefaultLogLevel

    /**
     * Switches the SDK to use Cloud Bucketing (via the DevCycle Bucketing API) instead of Local Bucketing.
     */
    enableCloudBucketing?: boolean

    /**
     * Enables the usage of EdgeDB for DevCycle that syncs User Data to DevCycle.
     * NOTE: This is only available with Cloud Bucketing.
     */
    enableEdgeDB?: boolean

    /**
     * Controls the polling interval in milliseconds to fetch new environment config changes, defaults to 10 seconds.
     * @min 1000
     */
    configPollingIntervalMS?: number

    /**
     * Controls the request timeout to fetch new environment config changes, defaults to 5 seconds,
     * must be less than the configPollingIntervalMS value.
     * @min 1000
     */
    configPollingTimeoutMS?: number

    /**
     * Controls the interval between flushing events to the DevCycle servers, defaults to 30 seconds.
     */
    eventFlushIntervalMS?: number

    /**
     * Disables logging of sdk generated events (e.g. aggVariableEvaluated, aggVariableDefaulted) to DevCycle.
     */
    disableAutomaticEventLogging?: boolean

    /**
     * Disables logging of custom events or user data to DevCycle.
     */
    disableCustomEventLogging?: boolean

    /**
     * Controls the maximum size the event queue can grow to until a flush is forced. Defaults to `1000`.
     */
    flushEventQueueSize?: number

    /**
     * Controls the maximum size the event queue can grow to until events are dropped. Defaults to `2000`.
     */
    maxEventQueueSize?: number

    /**
     * Allows the SDK to communicate with a proxy of DVC bucketing API / client SDK API. Overrides the base URL.
     */
    bucketingAPIURI?: string

    /**
     * Overrides the default URL for the DVC Events API when using local bucketing.
     */
    eventsAPIURI?: string

    /**
     * Overrides the default URL for the DVC Config CDN when using local bucketing.
     */
    configCDNURI?: string
}

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
     * Evaluation Reason as to why the variable was segmented into a specific Feature and
     * given this specific value
     */
    readonly evalReason?: unknown
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

    readonly evalReason?: unknown
}

export type DVCFeatureSet = Record<string, DVCFeature>
