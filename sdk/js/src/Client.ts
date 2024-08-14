import {
    DVCFeatureSet,
    DevCycleOptions,
    DVCVariableSet,
    DVCVariableValue,
    DevCycleEvent,
    DevCycleUser,
    ErrorCallback,
    DVCFeature,
    VariableDefinitions,
    UserError,
} from './types'

import { DVCVariable, DVCVariableOptions } from './Variable'
import { getConfigJson, saveEntity } from './Request'
import CacheStore from './CacheStore'
import { getStorageStrategy } from './DefaultCacheStore'
import { DVCPopulatedUser } from './User'
import { EventQueue, EventTypes } from './EventQueue'
import { checkParamDefined } from './utils'
import { EventEmitter } from './EventEmitter'
import type { BucketedUserConfig, VariableTypeAlias } from '@devcycle/types'
import { getVariableTypeFromValue } from '@devcycle/types'
import { ConfigRequestConsolidator } from './ConfigRequestConsolidator'
import { dvcDefaultLogger } from './logger'
import type { DVCLogger } from '@devcycle/types'
import { StreamingConnection } from './StreamingConnection'

type variableUpdatedHandler = (
    key: string,
    variable: DVCVariable<DVCVariableValue> | null,
) => void
type featureUpdatedHandler = (key: string, feature: DVCFeature | null) => void
type newVariablesHandler = () => void
type errorHandler = (error: unknown) => void
type initializedHandler = (success: boolean) => void
type configUpdatedHandler = (newVars: DVCVariableSet) => void
type variableEvaluatedHandler = (
    key: string,
    variable: DVCVariable<DVCVariableValue>,
) => void

export type DevCycleOptionsWithDeferredInitialization = DevCycleOptions & {
    deferInitialization: true
    bootstrapConfig?: never
}

export const isDeferredOptions = (
    arg: DevCycleUser | DevCycleOptionsWithDeferredInitialization,
): arg is DevCycleOptionsWithDeferredInitialization => {
    return !!arg && 'deferInitialization' in arg && arg.deferInitialization
}

export class DevCycleClient<
    Variables extends VariableDefinitions = VariableDefinitions,
> {
    logger: DVCLogger
    config?: BucketedUserConfig
    user?: DVCPopulatedUser
    _isInitialized = false
    public get isInitialized(): boolean {
        return this._isInitialized
    }

    private sdkKey: string
    private readonly options: DevCycleOptions

    private onInitialized: Promise<DevCycleClient<Variables>>
    private settleOnInitialized: (
        client: DevCycleClient<Variables>,
        err?: unknown,
    ) => void

    private userSaved = false
    private _closing = false
    private isConfigCached = false
    private initializeTriggered = false

    private variableDefaultMap: {
        [key: string]: { [key: string]: DVCVariable<any> }
    }
    private store: CacheStore
    private eventQueue: EventQueue
    private requestConsolidator: ConfigRequestConsolidator
    eventEmitter: EventEmitter
    private streamingConnection?: StreamingConnection
    private pageVisibilityHandler?: () => void
    private inactivityHandlerId?: number
    private windowMessageHandler?: (event: MessageEvent) => void
    private windowPageHideHandler?: () => void
    private configRefetchHandler: (lastModifiedDate?: number) => void

    constructor(
        sdkKey: string,
        user: undefined,
        options: DevCycleOptionsWithDeferredInitialization,
    )
    constructor(sdkKey: string, user: DevCycleUser, options?: DevCycleOptions)
    constructor(
        sdkKey: string,
        user: DevCycleUser | undefined,
        options: DevCycleOptions = {},
    ) {
        if (!options.sdkPlatform) {
            options.sdkPlatform = 'js'
        }
        if (options.next?.configRefreshHandler) {
            this.configRefetchHandler = options.next.configRefreshHandler
        }

        this.logger =
            options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.store = new CacheStore(
            options.storage || getStorageStrategy(),
            this.logger,
        )

        this.options = options

        this.sdkKey = sdkKey
        this.variableDefaultMap = {}
        this.eventQueue = new EventQueue(sdkKey, this, options)

        this.eventEmitter = new EventEmitter()
        this.registerVisibilityChangeHandler()

        this.onInitialized = new Promise((resolve, reject) => {
            this.settleOnInitialized = (value, error) => {
                if (error) {
                    this._isInitialized = false
                    reject(error)
                } else {
                    this._isInitialized = true
                    resolve(value)
                }
            }
        })

        if (!this.options.deferInitialization) {
            if (!user) {
                throw new Error('User must be provided to initialize SDK')
            }
            void this.clientInitialization(user)
        } else if (this.options.bootstrapConfig) {
            throw new Error(
                'bootstrapConfig option can not be combined with deferred initialization!',
            )
        }

        if (!options?.reactNative && typeof window !== 'undefined') {
            this.windowMessageHandler = (event: MessageEvent) => {
                const message = event.data
                if (message?.type === 'DVC.optIn.saved') {
                    this.refetchConfig(false)
                }
            }
            window.addEventListener('message', this.windowMessageHandler)

            this.windowPageHideHandler = () => {
                this.flushEvents()
            }
            window.addEventListener('pagehide', this.windowPageHideHandler)
        }
    }

    /**
     * Logic to initialize the client with the appropriate user and configuration data by making requests to DevCycle
     * and loading from local storage. This either happens immediately on client initialization, or when the user is
     * first identified (in deferred mode)
     * @param initialUser
     */
    private clientInitialization = async (initialUser: DevCycleUser) => {
        if (this.initializeTriggered || this._closing) {
            return this
        }
        this.initializeTriggered = true

        // don't wait to load anon id if we're being provided with a real one
        const storedAnonymousId = initialUser.user_id
            ? undefined
            : await this.store.loadAnonUserId()

        this.user = new DVCPopulatedUser(
            initialUser,
            this.options,
            undefined,
            storedAnonymousId,
        )

        if (!this.options.bootstrapConfig) {
            await this.getConfigCache(this.user)
        }

        // set up requestConsolidator and hook up callback methods
        this.requestConsolidator = new ConfigRequestConsolidator(
            (user: DVCPopulatedUser, extraParams) =>
                getConfigJson(
                    this.sdkKey,
                    user,
                    this.logger,
                    this.options,
                    extraParams,
                ),
            (config: BucketedUserConfig, user: DVCPopulatedUser) =>
                this.handleConfigReceived(config, user, Date.now()),
            this.user,
        )

        try {
            if (!this.options.bootstrapConfig) {
                await this.requestConsolidator.queue(this.user)
            } else {
                this.handleConfigReceived(
                    this.options.bootstrapConfig,
                    this.user,
                    Date.now(),
                )
            }
            this._isInitialized = true
            this.settleOnInitialized(this)
            this.logger.info('Client initialized')
        } catch (err) {
            this.initializeOnConfigFailure(this.user, err)
            return this
        }
        this.eventEmitter.emitInitialized(true)

        if (this.user.isAnonymous) {
            void this.store.saveAnonUserId(this.user.user_id)
        } else {
            void this.store.removeAnonUserId()
        }

        return this
    }

    /**
     * Complete initialization process without config so that we can return default values
     */
    private initializeOnConfigFailure = (
        user: DVCPopulatedUser,
        err?: unknown,
    ) => {
        if (this.isInitialized) {
            return
        }
        this.eventEmitter.emitInitialized(false)
        if (err) {
            this.eventEmitter.emitError(err)
        }
        void this.setUser(user)
        this.settleOnInitialized(this, err instanceof UserError ? err : null)
    }

    /**
     * Notify the user when configuration data has been loaded from the server.
     * An optional callback can be passed in, and will return
     * a promise if no callback has been passed in.
     */
    onClientInitialized(): Promise<DevCycleClient<Variables>>
    onClientInitialized(
        onInitialized: ErrorCallback<DevCycleClient<Variables>>,
    ): void
    onClientInitialized(
        onInitialized?: ErrorCallback<DevCycleClient<Variables>>,
    ): Promise<DevCycleClient<Variables>> | void {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized(null, this))
                .catch((err) => onInitialized(err))
            return
        }
        return this.onInitialized
    }

    /**
     * Get variable object associated with Features. Use the variable's key to fetch the DVCVariable object.
     * If the user does not receive the feature, the default value is used in the returned DVCVariable object.
     * DVCVariable is returned, which has a `value` property that is used to grab the variable value,
     * and a convenience method to pass in a callback to notify the user when the value has changed from the server.
     *
     * @param key
     * @param defaultValue
     */
    variable<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(key: K, defaultValue: T): DVCVariable<T> {
        if (defaultValue === undefined || defaultValue === null) {
            throw new Error('Default value is a required param')
        }

        // this will throw if type is invalid
        const type = getVariableTypeFromValue(
            defaultValue,
            key,
            this.logger,
            true,
        )

        const defaultValueKey =
            typeof defaultValue === 'string'
                ? defaultValue
                : JSON.stringify(defaultValue)

        let variable
        if (
            this.variableDefaultMap[key] &&
            this.variableDefaultMap[key][defaultValueKey]
        ) {
            variable = this.variableDefaultMap[key][
                defaultValueKey
            ] as DVCVariable<T>
        } else {
            const configVariable = this.config?.variables?.[key]

            const data: DVCVariableOptions<T> = {
                key,
                defaultValue,
            }

            if (configVariable) {
                if (configVariable.type === type) {
                    data.value = configVariable.value as VariableTypeAlias<T>
                    data.evalReason = configVariable.evalReason
                } else {
                    this.logger.warn(
                        `Type mismatch for variable ${key}. Expected ${type}, got ${configVariable.type}`,
                    )
                }
            }

            variable = new DVCVariable<T>(data)

            this.variableDefaultMap[key] = {
                [defaultValueKey]: variable,
                ...this.variableDefaultMap[key],
            }
        }

        this.trackVariableEvaluated(variable)

        this.eventEmitter.emitVariableEvaluated(variable)
        return variable
    }

    private trackVariableEvaluated(variable: DVCVariable<any>) {
        if (this.options.disableAutomaticEventLogging) return

        try {
            const variableFromConfig = this.config?.variables?.[variable.key]
            this.eventQueue.queueAggregateEvent({
                type: variable.isDefaulted
                    ? EventTypes.variableDefaulted
                    : EventTypes.variableEvaluated,
                target: variable.key,
                metaData: {
                    value: variable.value,
                    type: getVariableTypeFromValue(
                        variable.defaultValue,
                        variable.key,
                        this.logger,
                    ),
                    _variable: variableFromConfig?._id,
                },
            })
        } catch (e) {
            this.eventEmitter.emitError(e)
            this.logger.warn(`Error with queueing aggregate events ${e}`)
        }
    }

    /**
     * Get a variable's value associated with a Feature. Use the variable's key to fetch the variable's value.
     * If the user is not segmented into the feature, the default value is returned.
     *
     * @param key
     * @param defaultValue
     */
    variableValue<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(key: K, defaultValue: T): VariableTypeAlias<T> {
        return this.variable(key, defaultValue).value
    }

    /**
     * Update user data after SDK initialization, this will trigger updates to variable values.
     * The `callback` parameter or returned `promise` can be used to return the set of variables
     * for the new user.
     *
     * @param user
     * @param callback
     */
    identifyUser(user: DevCycleUser): Promise<DVCVariableSet>
    identifyUser(
        user: DevCycleUser,
        callback?: ErrorCallback<DVCVariableSet>,
    ): void
    identifyUser(
        user: DevCycleUser,
        callback?: ErrorCallback<DVCVariableSet>,
    ): Promise<DVCVariableSet> | void {
        const promise = this._identifyUser(user)

        if (callback && typeof callback == 'function') {
            promise
                .then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return
        }

        return promise
    }

    private async _identifyUser(user: DevCycleUser): Promise<DVCVariableSet> {
        let updatedUser: DVCPopulatedUser

        if (this.options.deferInitialization && !this.initializeTriggered) {
            await this.clientInitialization(user)
            return this.config?.variables || {}
        }

        void this.eventQueue.flushEvents()

        try {
            await this.onInitialized
            const storedAnonymousId = await this.store.loadAnonUserId()
            if (this.user && user.user_id === this.user.user_id) {
                updatedUser = this.user.updateUser(user, this.options)
            } else {
                updatedUser = new DVCPopulatedUser(
                    user,
                    this.options,
                    undefined,
                    storedAnonymousId,
                )
            }
            const config = await this.requestConsolidator.queue(updatedUser)
            if (user.isAnonymous || !user.user_id) {
                await this.store.saveAnonUserId(updatedUser.user_id)
            }
            return config.variables || {}
        } catch (err) {
            this.eventEmitter.emitError(err)
            throw err
        }
    }

    /**
     * Resets the user to an Anonymous user. `callback` or `Promise` can be used to return
     * the set of variables for the new user.
     *
     * @param callback
     */
    resetUser(): Promise<DVCVariableSet>
    resetUser(callback: ErrorCallback<DVCVariableSet>): void
    resetUser(
        callback?: ErrorCallback<DVCVariableSet>,
    ): Promise<DVCVariableSet> | void {
        let oldAnonymousId: string | null | undefined
        const anonUser = new DVCPopulatedUser(
            { isAnonymous: true },
            this.options,
        )
        const promise = new Promise<DVCVariableSet>((resolve, reject) => {
            this.eventQueue.flushEvents()

            this.onInitialized
                .then(() => this.store.loadAnonUserId())
                .then(async (cachedAnonId) => {
                    await this.store.removeAnonUserId()
                    oldAnonymousId = cachedAnonId
                    return
                })
                .then(() => this.requestConsolidator.queue(anonUser))
                .then(async (config) => {
                    await this.store.saveAnonUserId(anonUser.user_id)
                    resolve(config.variables || {})
                })
                .catch(async (e) => {
                    this.eventEmitter.emitError(e)
                    if (oldAnonymousId) {
                        await this.store.saveAnonUserId(oldAnonymousId)
                    }
                    reject(e)
                })
        })

        if (callback && typeof callback == 'function') {
            promise
                .then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return
        }
        return promise
    }

    /**
     * Retrieve data on all Features, Object mapped by feature `key`.
     * Use the `DVCFeature.segmented` value to determine if the user was segmented into a
     * feature's audience.
     */
    allFeatures(): DVCFeatureSet {
        return this.config?.features || {}
    }

    /**
     * Retrieve data on all Variables, Object mapped by variable `key`.
     */
    allVariables(): DVCVariableSet {
        return this.config?.variables || {}
    }

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
     *  - `variableEvaluated:*` -> (key: string, variable: DVCVariable)
     *  - `variableEvaluated:<variable.key>` -> (key: string, variable: DVCVariable)
     *
     * @param key
     * @param handler
     */
    subscribe(
        key: `variableUpdated:${string}`,
        handler: variableUpdatedHandler,
    ): void
    subscribe(key: `newVariables:${string}`, handler: newVariablesHandler): void
    subscribe(
        key: `featureUpdated:${string}`,
        handler: featureUpdatedHandler,
    ): void
    subscribe(
        key: `variableEvaluated:${string}`,
        handler: variableEvaluatedHandler,
    ): void
    subscribe(key: 'error', handler: errorHandler): void
    subscribe(key: 'initialized', handler: initializedHandler): void
    subscribe(key: 'configUpdated', handler: configUpdatedHandler): void
    subscribe(key: string, handler: (...args: any[]) => void): void {
        this.eventEmitter.subscribe(key, handler)
    }

    /**
     * Unsubscribe to remove existing event emitter subscription.
     *
     * @param key
     * @param handler
     */
    unsubscribe(key: string, handler?: (...args: any[]) => void): void {
        this.eventEmitter.unsubscribe(key, handler)
    }

    /**
     * Track Event to DevCycle
     *
     * @param event
     */
    track(event: DevCycleEvent): void {
        if (this._closing) {
            this.logger.error('Client is closing, cannot track new events.')
            return
        }
        if (this.options.disableCustomEventLogging) return

        checkParamDefined('type', event.type)
        this.onInitialized.then(() => {
            this.eventQueue.queueEvent(event)
        })
    }

    /**
     * Flush all queued events to DevCycle
     *
     * @param callback
     */
    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(() => callback?.())
    }

    /**
     * Close all open connections to DevCycle, flush any pending events and
     * stop any running timers and event handlers. Use to clean up a client instance
     * that is no longer needed.
     */
    async close(): Promise<void> {
        this.logger.debug('Closing client')

        this._closing = true

        if (document && this.pageVisibilityHandler) {
            document.removeEventListener(
                'visibilitychange',
                this.pageVisibilityHandler,
            )
        }
        if (this.windowMessageHandler) {
            window.removeEventListener('message', this.windowMessageHandler)
        }

        if (this.windowPageHideHandler) {
            window.removeEventListener('pagehide', this.windowPageHideHandler)
        }

        this.streamingConnection?.close()

        await this.eventQueue.close()
    }

    /**
     * Reflects whether `close()` has been called on the client instance.
     */
    get closing(): boolean {
        return this._closing
    }

    /**
     * Method to be called by the Isomorphic SDKs to update the bootstrapped config and user data when the server's
     * representation has changed.
     * NOTE: It is not recommended to call this yourself.
     * @param config
     * @param user
     * @param userAgent
     */
    synchronizeBootstrapData(
        config: BucketedUserConfig | null,
        user: DevCycleUser,
        userAgent?: string,
    ): void {
        const populatedUser = new DVCPopulatedUser(
            user,
            this.options,
            undefined,
            undefined,
            userAgent,
        )

        if (!config) {
            // config is null indicating we failed to fetch it, finish initialization so default values can be returned
            this.initializeOnConfigFailure(populatedUser)
            return
        }

        this.options.bootstrapConfig = config
        if (this.options.deferInitialization && !this.initializeTriggered) {
            // if Next SDK has deferred initialization until config was available, providing it as the boostrap config
            // will now trigger initialization
            void this.clientInitialization(user)
            return
        }

        this.handleConfigReceived(config, populatedUser, Date.now())
    }

    private async refetchConfig(
        sse: boolean,
        lastModified?: number,
        etag?: string,
    ) {
        await this.onInitialized
        if (this.configRefetchHandler) {
            this.configRefetchHandler(lastModified)
        } else {
            await this.requestConsolidator.queue(null, {
                sse,
                lastModified,
                etag,
            })
        }
    }

    private handleConfigReceived(
        config: BucketedUserConfig,
        user: DVCPopulatedUser,
        dateFetched: number,
    ) {
        const oldConfig = this.config
        this.config = config
        void this.store.saveConfig(config, user, dateFetched)
        this.isConfigCached = false

        void this.setUser(user)

        const oldFeatures = oldConfig?.features || {}
        const oldVariables = oldConfig?.variables || {}
        this.eventEmitter.emitFeatureUpdates(oldFeatures, config.features)
        this.eventEmitter.emitVariableUpdates(
            oldVariables,
            config.variables,
            this.variableDefaultMap,
        )
        // The URL including dvc_user means that this user is subscribed to a user specific ably channel
        // This means that the user is a debug user and we should emit a config update event even if the etag
        // is the same.
        const isDebugUser = this.config?.sse?.url?.includes('dvc_user')
        if (!oldConfig || isDebugUser || oldConfig.etag !== this.config.etag) {
            this.eventEmitter.emitConfigUpdate(config.variables)
        }

        // Update the streaming connection URL if it has changed (for ex. if the current user has targeting overrides)
        if (config?.sse?.url) {
            // construct the streamingConnection if necessary
            if (!this.streamingConnection) {
                if (!this.options.disableRealtimeUpdates) {
                    this.streamingConnection = new StreamingConnection(
                        config.sse.url,
                        this.onSSEMessage.bind(this),
                        this.logger,
                    )
                } else {
                    this.logger.info(
                        'Disabling Realtime Updates based on Initialization parameter',
                    )
                }
            } else if (config.sse.url !== oldConfig?.sse?.url) {
                this.streamingConnection.updateURL(config.sse.url)
            }
        }
    }

    private async setUser(user: DVCPopulatedUser) {
        if (this.user != user || !this.userSaved) {
            this.user = user

            await this.store.saveUser(user)

            if (
                !this.user.isAnonymous &&
                checkIfEdgeEnabled(
                    this.logger,
                    this.config,
                    this.options?.enableEdgeDB,
                    true,
                )
            ) {
                const res = await saveEntity(
                    this.user,
                    this.sdkKey,
                    this.logger,
                    this.options,
                )
                this.logger.info(`Saved response entity! ${res}`)
            }

            this.userSaved = true
        }
    }

    private onSSEMessage(message: unknown) {
        try {
            const parsedMessage = JSON.parse(message as string)
            const messageData = JSON.parse(parsedMessage.data)

            if (!messageData) {
                return
            }
            if (!messageData.type || messageData.type === 'refetchConfig') {
                if (
                    !this.config?.etag ||
                    messageData.etag !== this.config?.etag
                ) {
                    this.refetchConfig(
                        true,
                        messageData.lastModified,
                        messageData.etag,
                    ).catch((e) => {
                        this.logger.warn(`Failed to refetch config ${e}`)
                    })
                }
            }
        } catch (e) {
            this.logger.warn(`Streaming Connection: Unparseable message ${e}`)
        }
    }

    private registerVisibilityChangeHandler() {
        if (typeof document === 'undefined') {
            return
        }

        const inactivityDelay = this.config?.sse?.inactivityDelay || 120000
        this.pageVisibilityHandler = () => {
            if (!this.config?.sse) {
                return
            } else if (document.visibilityState === 'visible') {
                if (!this.streamingConnection?.isConnected()) {
                    this.logger.debug('Page became visible, refetching config')
                    this.refetchConfig(false).catch((e) => {
                        this.logger.warn(`Failed to refetch config ${e}`)
                    })
                    this.streamingConnection?.reopen()
                }
                window?.clearTimeout(this.inactivityHandlerId)
            } else {
                window?.clearTimeout(this.inactivityHandlerId)
                this.inactivityHandlerId = window?.setTimeout(() => {
                    this.logger.debug(
                        'Page is not visible, closing streaming connection',
                    )
                    this.streamingConnection?.close()
                }, inactivityDelay)
            }
        }

        document.addEventListener?.(
            'visibilitychange',
            this.pageVisibilityHandler,
        )
    }

    private async getConfigCache(user: DVCPopulatedUser) {
        if (this.options.disableConfigCache) {
            this.logger.info('Skipping config cache')
            return
        }

        const cachedConfig = await this.store.loadConfig(
            user,
            this.options.configCacheTTL,
        )

        if (cachedConfig) {
            this.config = cachedConfig
            this.isConfigCached = true
            this.eventEmitter.emitFeatureUpdates({}, cachedConfig.features)
            this.eventEmitter.emitVariableUpdates(
                {},
                cachedConfig.variables,
                this.variableDefaultMap,
            )
            this.logger.debug('Initialized with a cached config')
        }
    }
}

const checkIfEdgeEnabled = (
    logger: DVCLogger,
    config?: BucketedUserConfig,
    enableEdgeDB?: boolean,
    logWarning = false,
) => {
    if (config?.project?.settings?.edgeDB?.enabled) {
        return !!enableEdgeDB
    } else {
        if (enableEdgeDB && logWarning) {
            logger.warn(
                'EdgeDB is not enabled for this project. Only using local user data.',
            )
        }
        return false
    }
}
