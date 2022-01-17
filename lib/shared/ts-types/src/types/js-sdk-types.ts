// declare module 'dvc-js-client-sdk' {
import { DVCJSON } from './dvcJSON'

export type DVCVariableValue = string | number | boolean | DVCJSON

export type DVCVariableSet = {
    [key: string]: DVCVariableValue
}

export type DVCFeature = {
    readonly key: string

    readonly name: string

    readonly segmented: boolean

    readonly evaluationReason: unknown
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
// export function initialize(
//     environmentKey: string,
//     user: DVCUser,
//     options?: DVCOptions
// ): Promise<DVCClient>
//
// export function initializeSync(
//     environmentKey: string,
//     user: DVCUser,
//     options?: DVCOptions
// ): DVCClient

export interface DVCOptions {
    debug: boolean
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
    customData?: DVCJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: DVCJSON

    /**
     * Set by SDK automatically
     */
    readonly createdDate?: Date

    /**
     * Set by SDK automatically
     */
    readonly lastSeenDate?: Date

    /**
     * Set by SDK to 'web'
     */
    readonly platform?: string

    /**
     * Set by SDK to ??
     */
    readonly platformVersion?: string

    /**
     * Set by SDK to User-Agent
     */
    readonly deviceModel?: string

    /**
     * SDK type
     */
    readonly sdkType?: 'client' | 'server'

    /**
     * SDK Version
     */
    readonly sdkVersion?: string
}

export interface DVCClient {
    /**
     * User document describing
     */
    user: DVCUser

    /**
     *
     */
    onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient>

    /**
     * QUESTION:  which of these three method types do we choose?
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
     * Dynamic Variable Bucketing. The `callback` parameter or returned `Promise` can be
     * used to know that the user has been re-bucketed and all variables have been updated
     * based on the updated user data.
     *
     * @param user
     * @param callback
     */
    identifyUser(
        user: DVCUser,
        callback?: (err: Error | null, features: DVCFeatureSet) => void
    ): Promise<DVCFeatureSet>

    /**
     * Resets the user to an Anonymous user. `callback` or `Promise` can be used to know
     * that the user has been re-bucketed and all variables have been updated.
     *
     * @param callback
     */
    resetUser(
        callback?: (err: Error | null, features: DVCFeatureSet) => void
    ): Promise<DVCFeatureSet>

    /**
     * Retrieve all data on all Features, Object mapped by feature `key`.
     * Use the `DVCFeature.segmented` value to determine if the user was segmented into a
     * feature's audience.
     */
    allFeatures(): DVCFeatureSet

    /**
     * Retrieve all DynamicVariables, Object mapped by variable `key`.
     */
    allVariables(): DVCVariableSet

    /**
     * Subscribe to events emitted by the SDK, `onUpdate` will be called everytime an
     * event is emitted by the SDK.
     *
     * Events:
     *  - `initialized`
     *  - `error`
     *  - `variableUpdated:*`
     *  - `variableUpdated:<variable.key>`
     *  - `featureUpdated:*`
     *  - `featureUpdated:<feature.key>`
     *  - `bucketingUpdated`
     *
     * @param key
     * @param onUpdate
     */
    subscribe(key: string, onUpdate: (...args: unknown[]) => void): void

    /**
     * Unsubscribe to remove existing event emitter subscription.
     *
     * @param key
     * @param onUpdate
     */
    unsubscribe(key: string, onUpdate: (...args: unknown[]) => void): void

    /**
     * Track Event to DVC
     *
     * @param eventName
     * @param value
     * @param attributes
     */
    track(eventName: string, value?: number, attributes?: JSON): void

    /**
     * Track Page View to DVC
     *
     * @param pageName
     * @param attributes
     */
    trackPage(pageName: string, attributes?: JSON): void

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
     * Evaluation Reason as to why the variable was segmented into a specific Feature and
     * given this specific value
     */
    readonly evaluationReason: unknown

    /**
     * Use the onUpdate callback to be notified everytime the value of the variable
     * has been updated by new bucketing decisions.
     *
     * @param callback
     */
    onUpdate(callback: (value: DVCVariableValue) => void): DVCVariable
}
// }
