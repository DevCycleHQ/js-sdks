import {
    DVCClient as Client,
    DVCFeatureSet,
    DVCOptions,
    DVCVariableSet,
    DVCVariableValue,
    DVCEvent as ClientEvent,
    DVCUser,
    ErrorCallback,
} from './types'
import { DVCVariable, DVCVariableOptions } from './Variable'
import { getConfigJson, saveEntity } from './Request'
import CacheStore from './CacheStore'
import DefaultStorage from './DefaultStorage'
import { DVCPopulatedUser } from './User'
import { EventQueue, EventTypes } from './EventQueue'
import { checkParamDefined } from './utils'
import { EventEmitter } from './EventEmitter'
import {
    BucketedUserConfig,
    getVariableTypeFromValue,
    VariableTypeAlias,
} from '@devcycle/types'
import { ConfigRequestConsolidator } from './ConfigRequestConsolidator'
import { dvcDefaultLogger } from './logger'
import { DVCLogger } from '@devcycle/types'
import { StreamingConnection } from './StreamingConnection'

export class DVCClient implements Client {
    private options: DVCOptions
    private onInitialized: Promise<DVCClient>
    private variableDefaultMap: { [key: string]: { [key: string]: DVCVariable<any> } }
    private sdkKey: string
    private userSaved = false
    private _closing = false
    private isConfigCached = false

    logger: DVCLogger
    config?: BucketedUserConfig
    user: DVCPopulatedUser
    private store: CacheStore
    private eventQueue: EventQueue
    private requestConsolidator: ConfigRequestConsolidator
    eventEmitter: EventEmitter
    private streamingConnection?: StreamingConnection
    private pageVisibilityHandler?: () => void
    private inactivityHandlerId?: number
    private windowMessageHandler?: (event: MessageEvent) => void

    constructor(sdkKey: string, user: DVCUser, options: DVCOptions = {}) {
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.store = new CacheStore(
            options.storage || new DefaultStorage(), this.logger
        )

        this.options = options

        this.sdkKey = sdkKey
        this.variableDefaultMap = {}
        this.eventQueue = new EventQueue(sdkKey, this, options?.eventFlushIntervalMS)

        this.eventEmitter = new EventEmitter()
        this.registerVisibilityChangeHandler()

        this.onInitialized = this.store.loadAnonUserId().then((storedAnonymousId) => {
            this.user = new DVCPopulatedUser(user, options, undefined, storedAnonymousId)
            this.requestConsolidator = new ConfigRequestConsolidator(
                (user: DVCPopulatedUser, extraParams) => getConfigJson(
                    this.sdkKey, user, this.logger, this.options, extraParams
                ),
                (config: BucketedUserConfig, user: DVCPopulatedUser) =>
                    this.handleConfigReceived(config, user, Date.now()),
                this.user
            )

            if (!this.options.disableConfigCache) {
                return this.getConfigCache()
            } else {
                this.logger.info('Skipping config cache')
                return
            }
        }).then(() => {
            return this.initializeClient()
        }).then(() => {
            this.logger.info('Client initialized')
            return this
        })

        if (!options?.reactNative && typeof window !== 'undefined') {
            this.windowMessageHandler = (event: MessageEvent) => {
                const message = event.data
                if (message?.type === 'DVC.optIn.saved') {
                    this.refetchConfig(false)
                }
            }
            window.addEventListener('message', this.windowMessageHandler)
        }
    }

    onClientInitialized(): Promise<DVCClient>
    onClientInitialized(onInitialized: ErrorCallback<DVCClient>): void
    onClientInitialized(onInitialized?: ErrorCallback<DVCClient>): Promise<DVCClient> | void {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized(null, this))
                .catch((err) => onInitialized(err))
            return
        }
        return this.onInitialized
    }

    variable<T extends DVCVariableValue>(key: string, defaultValue: T): DVCVariable<T> {
        if (defaultValue === undefined || defaultValue === null) {
            throw new Error('Default value is a required param')
        }

        // this will throw if type is invalid
        const type = getVariableTypeFromValue(defaultValue, key, this.logger, true)

        const defaultValueKey = typeof defaultValue === 'string' ? defaultValue : JSON.stringify(defaultValue)

        let variable
        if (this.variableDefaultMap[key] && this.variableDefaultMap[key][defaultValueKey]) {
            variable = this.variableDefaultMap[key][defaultValueKey] as DVCVariable<T>
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
                        `Type mismatch for variable ${key}. Expected ${type}, got ${configVariable.type}`
                    )
                }
            }

            variable = new DVCVariable<T>(data)

            this.variableDefaultMap[key] = {
                [defaultValueKey]: variable,
                ...this.variableDefaultMap[key]
            }
        }

        try {
            const variableFromConfig = this.config?.variables?.[key]

            this.eventQueue.queueAggregateEvent({
                type: variable.isDefaulted
                    ? EventTypes.variableDefaulted
                    : EventTypes.variableEvaluated,
                target: variable.key,
                metaData: {
                    value: variable.value,
                    type: getVariableTypeFromValue(variable.defaultValue, variable.key, this.logger),
                    _variable: variableFromConfig?._id
                }
            })
        } catch (e) {
            this.eventEmitter.emitError(e)
            this.logger.warn(`Error with queueing aggregate events ${e}`)
        }

        return variable
    }

    identifyUser(user: DVCUser): Promise<DVCVariableSet>
    identifyUser(user: DVCUser,
        callback?: ErrorCallback<DVCVariableSet>): void
    identifyUser(
        user: DVCUser,
        callback?: ErrorCallback<DVCVariableSet>
    ): Promise<DVCVariableSet> | void {

        const promise = new Promise<DVCVariableSet>((resolve, reject) => {
            this.eventQueue.flushEvents()

            let updatedUser: DVCPopulatedUser

            this.onInitialized.then(() => {
                return this.store.loadAnonUserId()
            }).then((storedAnonymousId) => {
                if (user.user_id === this.user.user_id) {
                    updatedUser = this.user.updateUser(user, this.options)
                } else {
                    updatedUser = new DVCPopulatedUser(user, this.options, undefined, storedAnonymousId)
                }

                return this.requestConsolidator.queue(updatedUser)
            }).then((config) => {
                if (user.isAnonymous || !user.user_id) {
                    this.store.saveAnonUserId(updatedUser.user_id)
                }
                resolve(config.variables || {})
            }).catch((err) => {
                this.eventEmitter.emitError(err)
                reject(err)
            })
        })

        if (callback && typeof callback == 'function') {
            promise.then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return
        }

        return promise
    }

    resetUser(): Promise<DVCVariableSet>
    resetUser(callback: ErrorCallback<DVCVariableSet>): void
    resetUser(callback?: ErrorCallback<DVCVariableSet>): Promise<DVCVariableSet> | void {
        let oldAnonymousId: string | null | undefined
        const anonUser = new DVCPopulatedUser({ isAnonymous: true }, this.options)
        const promise = new Promise<DVCVariableSet>((resolve, reject) => {
            this.eventQueue.flushEvents()

            this.onInitialized.then(() => this.store.loadAnonUserId())
                .then((cachedAnonId) => {
                    this.store.removeAnonUserId()
                    oldAnonymousId = cachedAnonId
                    return
                })
                .then(() => this.requestConsolidator.queue(anonUser))
                .then((config) => {
                    this.store.saveAnonUserId(anonUser.user_id)
                    resolve(config.variables || {})
                }).catch((e) => {
                    this.eventEmitter.emitError(e)
                    if (oldAnonymousId) {
                        this.store.saveAnonUserId(oldAnonymousId)
                    }
                    reject(e)
                })
        })

        if (callback && typeof callback == 'function') {
            promise.then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return
        }
        return promise
    }

    allFeatures(): DVCFeatureSet {
        return this.config?.features || {}
    }

    allVariables(): DVCVariableSet {
        return this.config?.variables || {}
    }

    subscribe(key: string, handler: (...args: any[]) => void): void {
        this.eventEmitter.subscribe(key, handler)
    }

    unsubscribe(key: string, handler?: (...args: any[]) => void): void {
        this.eventEmitter.unsubscribe(key, handler)
    }

    track(event: ClientEvent): void {
        if (this._closing) {
            this.logger.error('Client is closing, cannot track new events.')
            return
        }
        checkParamDefined('type', event.type)
        this.onInitialized.then(() => {
            this.eventQueue.queueEvent(event)
        })
    }

    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(() => callback?.())
    }

    async close(): Promise<void> {
        this.logger.debug('Closing client')

        this._closing = true

        if (document && this.pageVisibilityHandler) {
            document.removeEventListener('visibilitychange', this.pageVisibilityHandler)
        }

        if (this.windowMessageHandler) {
            window.removeEventListener('message', this.windowMessageHandler)
        }

        this.streamingConnection?.close()

        await this.eventQueue.close()
    }

    get closing(): boolean {
        return this._closing
    }

    private async refetchConfig(sse: boolean, lastModified?: number) {
        await this.onInitialized
        await this.requestConsolidator.queue(null, { sse, lastModified })
    }

    private handleConfigReceived(config: BucketedUserConfig, user: DVCPopulatedUser, dateFetched: number) {
        const oldConfig = this.config
        this.config = config
        this.store.saveConfig(config, user, dateFetched)
        this.isConfigCached = false

        if (this.user != user || !this.userSaved) {
            this.user = user

            this.store.saveUser(user)

            if (!this.user.isAnonymous && checkIfEdgeEnabled(config, this.logger, this.options?.enableEdgeDB, true)) {
                saveEntity(this.user, this.sdkKey, this.logger, this.options)
                    .then((res) => this.logger.info(`Saved response entity! ${res}`))
            }

            this.userSaved = true
        }

        const oldFeatures = oldConfig?.features || {}
        const oldVariables = oldConfig?.variables || {}
        this.eventEmitter.emitFeatureUpdates(oldFeatures, config.features)
        this.eventEmitter.emitVariableUpdates(oldVariables, config.variables, this.variableDefaultMap)

        if (!oldConfig || (oldConfig.etag !== this.config.etag)) {
            this.eventEmitter.emitConfigUpdate(config.variables)
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
                if (!this.config?.etag || messageData.etag !== this.config?.etag) {
                    this.refetchConfig(true, messageData.lastModified).catch((e) => {
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
                    this.logger.debug('Page is not visible, closing streaming connection')
                    this.streamingConnection?.close()
                }, inactivityDelay)
            }
        }

        document.addEventListener?.('visibilitychange', this.pageVisibilityHandler)
    }

    private async getConfigCache() {
        const cachedConfig = await this.store.loadConfig(this.user, this.options.configCacheTTL)
        if (cachedConfig) {
            this.config = cachedConfig
            this.isConfigCached = true
            this.eventEmitter.emitFeatureUpdates({}, cachedConfig.features)
            this.eventEmitter.emitVariableUpdates({}, cachedConfig.variables, this.variableDefaultMap)
            this.logger.debug('Initialized with a cached config')
        }
    }

    private async initializeClient() {
        return this.requestConsolidator.queue(this.user)
            .then(() => {
                this.eventEmitter.emitInitialized(true)

                if (this.user.isAnonymous) {
                    this.store.saveAnonUserId(this.user.user_id)
                } else {
                    this.store.removeAnonUserId()
                }

                if (this.config?.sse?.url) {
                    this.streamingConnection = new StreamingConnection(
                        this.config.sse.url,
                        this.onSSEMessage.bind(this),
                        this.logger
                    )
                }

                return this
            })
            .catch((err) => {
                this.eventEmitter.emitInitialized(false)
                this.eventEmitter.emitError(err)
                return this
            })
    }
}

const checkIfEdgeEnabled = (
    config: BucketedUserConfig, logger: DVCLogger, enableEdgeDB?: boolean, logWarning = false
) => {
    if (config.project.settings?.edgeDB?.enabled) {
        return !!enableEdgeDB
    } else {
        if (enableEdgeDB && logWarning) {
            logger.warn('EdgeDB is not enabled for this project. Only using local user data.')
        }
        return false
    }
}
