import {
    DVCClient as Client,
    DVCFeatureSet,
    DVCOptions,
    DVCVariableSet,
    DVCVariableValue,
    DVCEvent as ClientEvent,
    DVCUser,
    ErrorCallback
} from './types'
import { DVCVariable } from './Variable'
import { getConfigJson, saveEntity } from './Request'
import Store from './Store'
import { DVCPopulatedUser } from './User'
import { EventQueue, EventTypes } from './EventQueue'
import { checkParamDefined } from './utils'
import { EventEmitter } from './EventEmitter'
import { BucketedUserConfig, VariableType, VariableValue } from '@devcycle/types'
import { ConfigRequestConsolidator } from './ConfigRequestConsolidator'
import { dvcDefaultLogger } from './logger'
import { DVCLogger } from '@devcycle/types'
import { StreamingConnection } from './StreamingConnection'

export class DVCClient implements Client {
    private options: DVCOptions
    private onInitialized: Promise<DVCClient>
    private variableDefaultMap: { [key: string]: { [key: string]: DVCVariable } }
    private environmentKey: string
    private userSaved = false
    private _closing = false

    logger: DVCLogger
    config?: BucketedUserConfig
    user: DVCPopulatedUser
    private store: Store
    private eventQueue: EventQueue
    private requestConsolidator: ConfigRequestConsolidator
    eventEmitter: EventEmitter
    private streamingConnection?: StreamingConnection
    private pageVisibilityHandler?: () => void
    private inactivityHandlerId?: number
    private windowMessageHandler?: (event: MessageEvent) => void

    constructor(environmentKey: string, user: DVCUser, options: DVCOptions = {}) {
        this.user = new DVCPopulatedUser(user, options)
        this.options = options
        this.environmentKey = environmentKey
        this.variableDefaultMap = {}
        this.eventQueue = new EventQueue(environmentKey, this, options?.eventFlushIntervalMS)
        this.requestConsolidator = new ConfigRequestConsolidator(
            (user: DVCPopulatedUser) => getConfigJson(this.environmentKey, user, this.logger, this.options),
            (config: BucketedUserConfig, user: DVCPopulatedUser) => this.handleConfigReceived(config, user),
            this.user
        )
        this.eventEmitter = new EventEmitter()
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.store = new Store(typeof window !== 'undefined' ? window.localStorage : stubbedLocalStorage, this.logger)
        this.registerVisibilityChangeHandler()

        this.onInitialized = this.requestConsolidator.queue(this.user)
            .then(() => {
                this.eventEmitter.emitInitialized(true)

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

        if (!options?.reactNative && typeof window !== 'undefined') {
            this.windowMessageHandler = (event: MessageEvent) => {
                const message = event.data
                if (message?.type === 'DVC.optIn.saved') {
                    this.refetchConfig()
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

    variable(key: string, defaultValue: DVCVariableValue): DVCVariable {
        if (defaultValue === undefined || defaultValue === null) {
            throw new Error('Default value is a required param')
        }
        const defaultValueKey = typeof defaultValue === 'string' ? defaultValue : JSON.stringify(defaultValue)

        let variable
        if (this.variableDefaultMap[key] && this.variableDefaultMap[key][defaultValueKey]) {
            variable = this.variableDefaultMap[key][defaultValueKey]
        } else {
            const data = {
                key,
                defaultValue,
                ...this.config?.variables?.[key]
            }

            variable = new DVCVariable(data)

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
                    type: getTypeFromDefaultValue(variable.defaultValue, variable.key, this.logger),
                    _variable: variableFromConfig?._id
                }
            })
        } catch (e) {
            this.eventEmitter.emitError(e)
            this.logger.error(`Error with queueing aggregate events ${e}`)
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
            if (user.user_id === this.user.user_id) {
                updatedUser = this.user.updateUser(user, this.options)
            } else {
                updatedUser = new DVCPopulatedUser(user, this.options)
            }

            this.onInitialized.then(() =>
                this.requestConsolidator.queue(updatedUser)
            ).then((config) => {
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
        const anonUser = new DVCPopulatedUser({ isAnonymous: true }, this.options)

        const promise = new Promise<DVCVariableSet>((resolve, reject) => {
            this.eventQueue.flushEvents()

            this.onInitialized.then(() => this.requestConsolidator.queue(anonUser))
                .then((config) => {
                    resolve(config.variables || {})
                }).catch((e) => {
                    this.eventEmitter.emitError(e)
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

    private async refetchConfig() {
        await this.onInitialized
        await this.requestConsolidator.queue()
    }

    private handleConfigReceived(config: BucketedUserConfig, user: DVCPopulatedUser) {
        const oldConfig = this.config
        this.config = config

        this.store.saveConfig(config).then(() => {
            this.logger.info('Successfully saved config to local storage')
        })

        if (this.user != user || !this.userSaved) {
            this.user = user

            this.store.saveUser(user).then(() => {
                this.logger.info('Successfully saved user to local storage')
            })

            if (!this.user.isAnonymous && checkIfEdgeEnabled(config, this.logger, this.options?.enableEdgeDB, true)) {
                saveEntity(this.user, this.environmentKey, this.logger, this.options)
                    .then((res) => this.logger.info(`Saved response entity! ${res}`))
            }

            this.userSaved = true
        }

        const oldFeatures = oldConfig?.features || {}
        const oldVariables = oldConfig?.variables || {}
        this.eventEmitter.emitFeatureUpdates(oldFeatures, config.features)
        this.eventEmitter.emitVariableUpdates(oldVariables,
            config.variables, this.variableDefaultMap)

    }

    private onSSEMessage(message: unknown) {
        try {
            const parsedMessage = JSON.parse(message as string)
            const messageData = parsedMessage.data

            if (!messageData) {
                return
            }
            if (!messageData.type || messageData.type === 'refetchConfig') {
                if (!this.config?.etag || messageData.etag !== this.config?.etag) {
                    this.refetchConfig().catch((e) => {
                        this.logger.error('Failed to refetch config', e)
                    })
                }
            }
        } catch (e) {
            this.logger.error('Streaming Connection: Unparseable message', e)
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
                    this.refetchConfig().catch((e) => {
                        this.logger.error('Failed to refetch config', e)
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

const getTypeFromDefaultValue = (defaultValue: VariableValue, key: string, logger: DVCLogger) => {
    if (typeof defaultValue === 'boolean') {
        return VariableType.boolean
    } else if (typeof defaultValue === 'number') {
        return VariableType.number
    } else if (typeof defaultValue === 'string') {
        return VariableType.string
    } else if (typeof defaultValue === 'object') {
        return VariableType.object
    } else {
        logger.warn(`The default value for variable ${key} is not of type Boolean, Number, String, or JSON`)
        return undefined
    }
}

const stubbedLocalStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0
}
