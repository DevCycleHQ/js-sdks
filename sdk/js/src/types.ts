
export type DVCVariableValue = string | number | boolean | JSON
export type JSON = { [key: string]: string | number | boolean }

export interface ErrorCallback<T> {
    (err: Error, result?: null | undefined): void
    (err: null | undefined, result: T): void
}

export type DVCVariableSet = {
    [key: string]: Pick<DVCVariable, 'key' | 'value' | 'evalReason'> & {
        '_id': string,
        'type': string
    }
}

export type DVCFeature = {
    readonly _id: string
    readonly _variation: string
    readonly key: string
    readonly type: string
    readonly evalReason?: any
}

export type DVCFeatureSet = {
    [key: string]: DVCFeature
}

/**
 * Initialize the SDK
 * @param environmentKey
 * @param user
 * @param options
 */
export type initialize = (
    environmentKey: string,
    user: DVCUser,
    options?: DVCOptions
) => DVCClient

export interface DVCOptions {
    flushEventsMS?: number
    reactNative?: boolean
    enableCloudData?: boolean
}

export interface DVCUser {
    /**
     * Users must be explicitly defined as anonymous, where the SDK will
     * generate a random `user_id` for them. If they are `isAnonymous = false`
     * a `user_id` value must be provided.
     */
    isAnonymous: boolean

    /**
     * Must be defined if `isAnonymous = false`
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
    customData?: JSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: JSON
}

export interface DVCClient {
    /**
     * User document describing
     */
    user: DVCUser

    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return
     * a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    onClientInitialized(): Promise<DVCClient>
    onClientInitialized(onInitialized: ErrorCallback<DVCClient>): void

    /**
     * Grab variable values associated with Features. Use the key created in the dashboard to fetch
     * the variable value. If the user does not receive the feature, the default value is used in the DVCVariable.
     * DVCVariable is returned, which has a value property that is used to grab the variable value,
     * and a convenience method to pass in a callback to notify the user when the value has changed from the server.
     *
     * @param key
     * @param defaultValue
     */
    variable(
        key: string,
        defaultValue: DVCVariableValue
    ): DVCVariable

    /**
     * Update user data after SDK initialization, this will trigger updates to Feature Flag /
     * Dynamic Variable Bucketing. The `callback` parameter or returned `Promise` can be used to
     * return the Variables for the new user.
     *
     * @param user
     * @param callback
     */
    identifyUser(
        user: DVCUser
    ): Promise<DVCVariableSet>
    identifyUser(
        user: DVCUser,
        callback: ErrorCallback<DVCVariableSet>
    ): void

    /**
     * Resets the user to an Anonymous user. `callback` or `Promise` can be used to return the
     * Variables for the anonymous user.
     *
     * @param callback
     */
    resetUser(
    ): Promise<DVCVariableSet>
    resetUser(
        callback: ErrorCallback<DVCVariableSet>
    ): void

    /**
     * Retrieve all data on all Features, Object mapped by feature `key`.
     * Use the `DVCFeature.segmented` value to determine if the user was segmented into a
     * feature's audience.
     */
    allFeatures(): DVCFeatureSet

    /**
     * Retrieve all data on all Variables, Object mapped by feature `key`.
     */
    allVariables(): DVCVariableSet

    /**
     * Subscribe to events emitted by the SDK, `onUpdate` will be called everytime an
     * event is emitted by the SDK.
     *
     * Events:
     *  - `initialized` -> (initialized: boolean)
     *  - `error` -> (error: Error)
     *  - `variableUpdated:*` -> (key: string, variable: DVCVariable)
     *  - `variableUpdated:<variable.key>` -> (key: string, variable: DVCVariable)
     *  - `featureUpdated:*` -> (key: string, feature: DVCFeature)
     *  - `featureUpdated:<feature.key>` -> (key: string, feature: DVCFeature)
     *
     * @param key
     * @param onUpdate
     */
    subscribe(key: string, handler: (...args: any[]) => void): void

    /**
     * Unsubscribe to remove existing event emitter subscription.
     *
     * @param key
     * @param onUpdate
     */
    unsubscribe(key: string, handler?: (...args: any[]) => void): void

    /**
     * Track Event to DVC
     *
     * @param event
     */
    track(event: DVCEvent): void

    /**
     * Flush all queued events to DVC
     *
     * @param callback
     */
    flushEvents(callback?: () => void): Promise<void>
}

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
    onUpdate(callback: (value: DVCVariableValue) => void): DVCVariable
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

type DeviceInfo = {
    getModel: () => string
}
declare global {
   // eslint-disable-next-line no-var
  var DeviceInfo: DeviceInfo | undefined
}
