import { DVCLogger, DVCDefaultLogLevel, DVCReporter, DVCJSON, VariableValue } from '@devcycle/types'

export interface DVCUser {
    /**
     * Identifies the current user. Must be defined
     */
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    name?: string

    /**
     * ISO 639-1 two-letter codes, or ISO 639-2 three-letter codes
     */
    language?: string

    /**
     * ISO 3166 two or three-letter codes
     */
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    customData?: DVCJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: DVCJSON
}

/**
 * Options to control the setup of the DevCycle NodeJS Server SDK.
 */
export interface DVCOptions {
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
     * Allows the SDK to communicate with a proxy of DVC bucketing API / client SDK API.
     */
    apiProxyURL?: string

    /**
     * Allows the override of the baseUrl for ALL requests from the SDK (including events). Mainly used for testing.
     */
    baseURLOverride?: string
}

export type DVCVariableValue = VariableValue
export type JSON = DVCJSON
export type { DVCJSON }

export type DVCVariableSet = Record<string,
    Omit<DVCVariable, 'defaultValue' | 'isDefaulted'> & { _id: string }
>

export interface DVCVariable {
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

export interface DVCEvent {
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
