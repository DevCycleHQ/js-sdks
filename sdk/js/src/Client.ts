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
import { BucketedUserConfig } from '@devcycle/types'
import { RequestConsolidator } from './RequestConsolidator'
import { dvcDefaultLogger } from './logger'
import { DVCLogger } from '@devcycle/types'

export class DVCClient implements Client {
    private options: DVCOptions
    private onInitialized: Promise<DVCClient>
    private variableDefaultMap: { [key: string]: { [key: string]: DVCVariable } }
    private environmentKey: string
    logger: DVCLogger
    config?: BucketedUserConfig
    user: DVCPopulatedUser
    store: Store
    eventQueue: EventQueue
    requestConsolidator: RequestConsolidator
    eventEmitter: EventEmitter

    constructor(environmentKey: string, user: DVCPopulatedUser, options: DVCOptions = {}) {
        this.user = user
        this.options = options
        this.environmentKey = environmentKey
        this.variableDefaultMap = {}
        this.eventQueue = new EventQueue(environmentKey, this, options?.flushEventsMS)
        this.requestConsolidator = new RequestConsolidator()
        this.eventEmitter = new EventEmitter()
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        const stubbedLocalStorage = { 
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
            clear: () => undefined,
            key: () => null,
            length: 0 }
        this.store = new Store(typeof window !== "undefined" ? window.localStorage : stubbedLocalStorage, this.logger)

        this.store.saveUser(this.user)
            .then(() => this.logger.info('Successfully saved user to local storage!'))

        this.onInitialized = getConfigJson(environmentKey, this.user, options?.enableEdgeDB || false, this.logger)
            .then((config) => {
                const oldConfig = this.config
                this.config = config as BucketedUserConfig

                if (checkIfEdgeEnabled(this.config, this.logger, this.options?.enableEdgeDB, true)) {
                    if (!this.user.isAnonymous) {
                        saveEntity(this.user, this.environmentKey, this.logger)
                            .then((res) => this.logger.info(`Saved response entity! ${res}`))
                    }
                }

                this.store.saveConfig(config)
                    .then(() => this.logger.info('Successfully saved config to local storage'))
                this.eventEmitter.emitInitialized(true)
                this.eventEmitter.emitFeatureUpdates(oldConfig?.features || {}, this.config.features)
                this.eventEmitter.emitVariableUpdates(oldConfig?.variables || {},
                    this.config.variables, this.variableDefaultMap)
                return this
            })
            .catch((err) => {
                this.eventEmitter.emitInitialized(false)
                this.eventEmitter.emitError(err)
                return this
            })
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
            this.eventQueue.queueAggregateEvent({
                type: variable.isDefaulted
                    ? EventTypes.variableDefaulted
                    : EventTypes.variableEvaluated,
                target: variable.key,
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
            try {
                this.eventQueue.flushEvents()

                let updatedUser: DVCPopulatedUser
                if (user.user_id === this.user.user_id) {
                    updatedUser = this.user.updateUser(user)
                } else {
                    updatedUser = new DVCPopulatedUser(user, this.options)
                }

                const oldConfig = this.config || {} as BucketedUserConfig

                this.onInitialized.then(() =>
                    this.requestConsolidator.queue('identify',
                        getConfigJson(this.environmentKey, updatedUser, this.options?.enableEdgeDB || false,
                            this.logger)
                    )
                ).then((config) => {
                    this.config = config as BucketedUserConfig

                    if (checkIfEdgeEnabled(this.config, this.logger, this.options?.enableEdgeDB)) {
                        if (!updatedUser.isAnonymous) {
                            saveEntity(updatedUser, this.environmentKey, this.logger)
                                .then((res) => this.logger.info(`Saved response entity! ${res}`))
                        }
                    }

                    this.store.saveConfig(config)
                        .then(() => this.logger.info('Successfully saved config to local storage'))
                    const oldFeatures = oldConfig.features || {}
                    const oldVariables = oldConfig.variables || {}
                    this.eventEmitter.emitFeatureUpdates(oldFeatures, config.features)
                    this.eventEmitter.emitVariableUpdates(oldVariables,
                        config.variables, this.variableDefaultMap)

                    return config.variables
                }).then((variables) => {
                    this.user = updatedUser
                    this.store.saveUser(updatedUser)
                        .then(() => this.logger.info('Successfully saved user to local storage!'))
                    return resolve(variables || {})
                }).catch((err) => Promise.reject(err))

            } catch (err) {
                this.eventEmitter.emitError(err)
                reject(err)
            }
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
            try {
                this.eventQueue.flushEvents()
                const oldConfig = this.config || {} as BucketedUserConfig

                this.onInitialized.then(() =>
                    this.requestConsolidator.queue('identify',
                        // don't send edgedb param for anonymous users
                        getConfigJson(this.environmentKey, anonUser, false, this.logger)
                    )
                ).then((config) => {
                    this.config = config as BucketedUserConfig
                    this.user = anonUser
                    this.store.saveConfig(config).then(() => {
                        this.logger.info('Successfully saved config to local storage')
                    })
                    this.store.saveUser(anonUser).then(() => {
                        this.logger.info('Successfully saved user to local storage!')
                    })
                    const oldFeatures = oldConfig.features || {}
                    const oldVariables = oldConfig.variables || {}
                    this.eventEmitter.emitFeatureUpdates(oldFeatures, config.features)
                    this.eventEmitter.emitVariableUpdates(oldVariables,
                        config.variables, this.variableDefaultMap)
                    resolve(config.variables || {})
                }).catch((e) => {
                    reject(e)
                })

            } catch (e) {
                this.eventEmitter.emitError(e)
                reject(e)
            }
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
        checkParamDefined('type', event.type)
        this.onInitialized.then(() => {
            this.eventQueue.queueEvent(event)
        })
    }

    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(() => callback?.())
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
