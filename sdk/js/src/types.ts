import type {
    DVCLogger,
    DVCDefaultLogLevel,
    VariableTypeAlias,
    VariableValue,
    DVCJSON,
    DevCycleJSON,
    DVCCustomDataJSON,
    BucketedUserConfig,
} from '@devcycle/types'
export { UserError } from '@devcycle/types'

export type DVCVariableValue = VariableValue
export type { DVCJSON, DVCCustomDataJSON, DevCycleJSON }

export interface ErrorCallback<T> {
    (err: Error, result?: null | undefined): void
    (err: null | undefined, result: T): void
}

export type DVCVariableSet = {
    [key: string]: Pick<
        DVCVariable<DVCVariableValue>,
        'key' | 'value' | 'evalReason'
    > & {
        _id: string
        type: string
    }
}

export type DVCFeature = {
    readonly _id: string
    readonly _variation: string
    readonly variationKey: string
    readonly variationName: string
    readonly key: string
    readonly type: string
    readonly evalReason?: any
}

export type DVCFeatureSet = {
    [key: string]: DVCFeature
}

export interface DevCycleOptions {
    /**
     * Controls the interval between flushing events to the DevCycle servers in milliseconds, defaults to 10 seconds.
     */
    eventFlushIntervalMS?: number
    /**
     * Overrides the default logger implementation
     */
    logger?: DVCLogger
    /**
     * Controls the log level of the SDK, defaults to `error`
     */
    logLevel?: DVCDefaultLogLevel
    /**
     * Enables the usage of EdgeDB for DevCycle that syncs User Data to DevCycle.
     */
    enableEdgeDB?: boolean
    /**
     * Allows the SDK to communicate with a proxy of DevCycle APIs.
     */
    apiProxyURL?: string
    /**
     * Disable the use of cached configs
     */
    disableConfigCache?: boolean
    /**
     * The maximum allowed age of a cached config in milliseconds, defaults to 7 days
     */
    configCacheTTL?: number
    /**
     * overridable storage implementation for caching config and storing anonymous user id
     */
    storage?: DVCStorage
    /**
     * Used to know if we are running in a React Native environment.
     */
    reactNative?: boolean
    /**
     * Disable Realtime Update and their SSE connection.
     */
    disableRealtimeUpdates?: boolean
    /**
     * Defer fetching configuration from DevCycle until `client.identifyUser` is called. Useful when user data is not
     * available yet at time of client instantiation.
     **/
    deferInitialization?: boolean
    /**
     * Disables logging of SDK generated events (e.g. variableEvaluated, variableDefaulted) to DevCycle.
     */
    disableAutomaticEventLogging?: boolean
    /**
     * Disables logging of custom events generated by calling .track() method to DevCycle.
     */
    disableCustomEventLogging?: boolean

    /**
     * Controls the maximum size the event queue can grow to until a flush is forced. Defaults to `100`.
     */
    flushEventQueueSize?: number

    /**
     * Controls the maximum size the event queue can grow to until events are dropped. Defaults to `1000`.
     */
    maxEventQueueSize?: number

    /**
     * A full configuration payload to boostrap the SDK with. This will immediately initialize the SDK with
     * the provided data and prevent a server roundtrip to fetch a new config. This option can be used for passing
     * in a config that was prefetched in a server-side rendered environment, or to implement a custom caching
     * system.
     */
    bootstrapConfig?: BucketedUserConfig

    /**
     * options set by Next SDK. Not for direct use.
     */
    next?: {
        configRefreshHandler?: (lastModifiedDate?: number) => void
    }

    /**
     * Enable obfuscation of the variable keys in the SDK. This setting should be used with a generated DevCycle client
     * using the CLI.
     */
    enableObfuscation?: boolean

    /**
     * The platform the SDK is running in. This is used for logging purposes.
     * Example values ('of' for OpenFeature): 'js' | 'react' | 'react-native' | 'nextjs' | 'js-of' | 'react-of'
     */
    sdkPlatform?: string
}

export interface DevCycleUser<T extends DVCCustomDataJSON = DVCCustomDataJSON> {
    /**
     * If a user is anonymous a unique anonymous user id will be generated and stored in the cache.
     * If no user_id is provided, the user is assumed to be anonymous.
     */
    isAnonymous?: boolean

    /**
     * A unique user ID. If not provided, an anonymous user ID will be generated.
     */
    user_id?: string

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
     * ISO 639-1 two letter codes, or ISO 639-2 three letter codes
     */
    language?: string

    /**
     * ISO 3166 two or three letter codes
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
    customData?: T

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: T
}

/**
 * Used to support strong typing of flag strings in the SDK.
 * Usage;
 * ```ts
 * import '@devcycle/js-client-sdk';
 * declare module '@devcycle/js-client-sdk' {
 *   interface CustomVariableDefinitions {
 *     'flag-one': boolean;
 *   }
 * }
 * ```
 * Or when using the cli generated types;
 * ```ts
 * import '@devcycle/js-client-sdk';
 * declare module '@devcycle/js-client-sdk' {
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

export interface DVCVariable<T extends DVCVariableValue> {
    /**
     * Unique "key" by Project to use for this Dynamic Variable.
     */
    readonly key: VariableKey

    /**
     * The value for this Dynamic Variable which will be set to the `defaultValue`
     * if accessed before the SDK is fully Initialized
     */
    readonly value: VariableTypeAlias<T>

    /**
     * Default value set when creating the variable
     */
    readonly defaultValue: T

    /**
     * If the `variable.value` is set to use the `defaultValue` this will be `true`.
     */
    isDefaulted: boolean

    /**
     * Evaluation Reason as to why the variable was segmented into a specific Feature and
     * given this specific value
     */
    readonly evalReason?: any

    /**
     * Use the onUpdate callback to be notified everytime the value of the variable
     * has been updated by new bucketing decisions.
     *
     * @param callback
     */
    onUpdate(callback: (value: VariableTypeAlias<T>) => void): DVCVariable<T>
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

export interface DVCStorage {
    /**
     * Save a value to the cache store
     * @param key
     * @param value
     **/
    save(key: string, value: unknown): Promise<void>

    /**
     * Get a value from the cache store
     * @param key
     */
    load<T>(key: string): Promise<T | undefined>

    /**
     * Remove a value from the cache store
     * @param key
     */
    remove(key: string): Promise<void>
}

export const StoreKey = {
    User: 'dvc:user',
    AnonUserId: 'dvc:anonymous_user_id',
    AnonymousConfig: 'dvc:anonymous_config',
    IdentifiedConfig: 'dvc:identified_config',
}

type DeviceInfo = {
    getModel: () => string
}
declare global {
    // eslint-disable-next-line no-var
    var DeviceInfo: DeviceInfo | undefined
}
