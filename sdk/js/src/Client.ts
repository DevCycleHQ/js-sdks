import {
    DVCClient as Client, DVCFeatureSet, DVCOptions, DVCVariableSet, DVCVariableValue, DVCEvent as ClientEvent
} from 'dvc-js-client-sdk'
import { DVCVariable } from './Variable'
import { getConfigJson } from './Request'
import Store from './Store'
import { DVCUser, UserParam } from './User'
import { EventQueue, EventTypes } from './EventQueue'
import { BucketedUserConfig } from './Request'
import { checkParamDefined } from './utils'
import { EventEmitter } from './EventEmitter'

export class DVCClient implements Client {
    private options?: DVCOptions
    private onInitialized: Promise<DVCClient>
    private variableDefaultMap: { [key: string]: { [key: string]: DVCVariable } }
    private environmentKey: string
    config?: BucketedUserConfig
    user: DVCUser
    store: Store
    eventQueue: EventQueue
    eventEmitter: EventEmitter

    constructor(environmentKey: string, user: DVCUser, options?: DVCOptions) {
        this.store = new Store(window.localStorage)
        this.user = user
        this.options = options
        this.environmentKey = environmentKey
        this.variableDefaultMap = {}
        this.eventQueue = new EventQueue(environmentKey, this, options?.flushEventsMS)
        this.eventEmitter = new EventEmitter()

        this.store.saveUser(user)
            .then(() => console.log('Successfully saved user to local storage!'))

        this.onInitialized = getConfigJson(environmentKey, user)
            .then((config) => {
                const oldConfig = this.config
                this.config = config as BucketedUserConfig
                this.store.saveConfig(config)
                    .then(() => console.log('Successfully saved config to local storage'))
                this.eventEmitter.emitInitialized(true)
                this.eventEmitter.emitFeatureUpdates(oldConfig?.features || {}, this.config.features)
                this.eventEmitter.emitVariableUpdates(oldConfig?.variables || {}, this.config.variables, this.variableDefaultMap)
                return this
            })
            .catch((err) => {
                this.eventEmitter.emitInitialized(false)
                this.eventEmitter.emitError(err)
                return this
            })
    }

    onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
            return null
        }
        return this.onInitialized
    }

    variable(key: string, defaultValue: DVCVariableValue): DVCVariable {
        const defaultValueKey = JSON.stringify(defaultValue).replace(/"/g, "")
        if (this.variableDefaultMap[key] && this.variableDefaultMap[key][defaultValueKey]) {
            return this.variableDefaultMap[key][defaultValueKey]
        }

        const data = {
            key,
            defaultValue,
            ...this.config?.variables?.[key]
        }
        const variable = new DVCVariable(data)
        this.variableDefaultMap[key] = { 
            [defaultValueKey]: variable,
            ...this.variableDefaultMap[key]
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
            console.log('Error with queueing aggregate events', e)
        }

        return variable
    }

    identifyUser(user: UserParam, callback?: (err: Error, variables: DVCVariableSet) => void): Promise<DVCVariableSet> {
        const promise = new Promise<DVCVariableSet>((resolve, reject) => {
            try {
                this.eventQueue.flushEvents()

                let updatedUser: DVCUser
                if (user.user_id === this.user.user_id) {
                    updatedUser = this.user.updateUser(user)
                } else {
                    updatedUser = new DVCUser(user)
                }

                const oldConfig = this.config

                getConfigJson(this.environmentKey, updatedUser)
                    .then((config) => {
                        this.config = config as BucketedUserConfig
                        this.store.saveConfig(config)
                            .then(() => console.log('Successfully saved config to local storage'))
                        this.eventEmitter.emitFeatureUpdates(oldConfig.features, config.features)
                        this.eventEmitter.emitVariableUpdates(oldConfig.variables, config.variables, this.variableDefaultMap)

                        return config.variables
                    })
                    .then((variables) => {
                        this.user = updatedUser
                        this.store.saveUser(updatedUser)
                            .then(() => console.log('Successfully saved user to local storage!'))
                        return resolve(variables)
                    })
                    .catch((err) => Promise.reject(err))
            } catch (err) {
                this.eventEmitter.emitError(err)
                reject(err)
            }
        })

        if (callback && typeof callback == 'function') {
            promise.then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return null
        }

        return promise
    }

    resetUser(callback?: (err: Error, variables: DVCVariableSet) => void): Promise<DVCVariableSet> {
        const promise = this.store.loadAnonUser().then((anonUser) => {
            try {
                this.eventQueue.flushEvents()

                const updatedUser = anonUser ? new DVCUser(JSON.parse(anonUser)) : new DVCUser({ isAnonymous: true })
                const oldConfig = this.config

                return getConfigJson(this.environmentKey, updatedUser)
                    .then((config) => {
                        this.config = config as BucketedUserConfig
                        this.user = updatedUser
                        this.store.saveConfig(config).then(() => {
                            console.log('Successfully saved config to local storage')
                        })
                        this.store.saveUser(updatedUser).then(() => {
                            console.log('Successfully saved user to local storage!')
                        })
                        this.eventEmitter.emitFeatureUpdates(oldConfig.features, config.features)
                        this.eventEmitter.emitVariableUpdates(oldConfig.variables, config.variables, this.variableDefaultMap)
                        return config.variables
                    }).catch((e) => {
                        throw new Error(e)
                    })
            } catch (e) {
                this.eventEmitter.emitError(e)
                throw new Error(e)
            }
        })

        if (callback && typeof callback == 'function') {
            promise.then((variables) => callback(null, variables))
                .catch((err) => callback(err, null))
            return null
        }
        return promise
    }

    allFeatures(): DVCFeatureSet {
        return this.config?.features || {}
    }

    allVariables(): DVCVariableSet {
        return this.config?.variables || {}
    }

    subscribe(key: string, handler: (...args: any[]) => void) {
        this.eventEmitter.subscribe(key, handler)
    }

    unsubscribe(key: string, handler?: (...args: any[]) => void) {
        this.eventEmitter.unsubscribe(key, handler)
    }

    track(event: ClientEvent) {
        checkParamDefined('type', event.type)

        this.onInitialized.then(() => {
            this.eventQueue.queueEvent(event)
        })
    }

    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(() => callback?.())
    }
}
