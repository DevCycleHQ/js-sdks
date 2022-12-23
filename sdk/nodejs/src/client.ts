import {
    DVCOptions,
    DVCVariableValue,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent
} from './types'
import { EnvironmentConfigManager } from './environmentConfigManager'
import { bucketUserForConfig } from './utils/userBucketingHelper'
import { DVCVariable, VariableParam } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { EventQueue, EventTypes } from './eventQueue'
import { dvcDefaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import * as packageJson from '../package.json'
import { importBucketingLib, getBucketingLib } from './bucketing'
import { DVCLogger, getVariableTypeFromValue, VariableTypeAlias } from '@devcycle/types'
import os from 'os'
import { DVCUser } from './models/user'

interface IPlatformData {
    platform: string
    platformVersion: string
    sdkType: string
    sdkVersion: string,
    hostname?: string
}

const castIncomingUser = (user: DVCUser) => {
    if (!(user instanceof DVCUser)) {
        return new DVCUser(user)
    }
    return user
}

export class DVCClient {
    private environmentKey: string
    private configHelper: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DVCClient>
    private logger: DVCLogger
    private initialized = false

    constructor(environmentKey: string, options?: DVCOptions) {
        this.environmentKey = environmentKey
        this.logger = options?.logger || dvcDefaultLogger({ level: options?.logLevel })

        if (options?.enableEdgeDB) {
            this.logger.info('EdgeDB can only be enabled for the DVC Cloud Client.')
        }

        const initializePromise = importBucketingLib({ options, logger: this.logger })
            .then(() => {
                this.configHelper = new EnvironmentConfigManager(this.logger, environmentKey, options || {})
                this.eventQueue = new EventQueue(
                    environmentKey,
                    {
                        ...options,
                        logger: this.logger
                    },
                )

                const platformData: IPlatformData = {
                    platform: 'NodeJS',
                    platformVersion: process.version,
                    sdkType: 'server',
                    sdkVersion: packageJson.version,
                    hostname: os.hostname()
                }

                getBucketingLib().setPlatformData(JSON.stringify(platformData))

                return this.configHelper.fetchConfigPromise
            })

        this.onInitialized = initializePromise
            .then(() => {
                this.logger.info('DevCycle initialized')
                this.initialized = true
                return this
            })
            .catch((err) => {
                this.logger.error(`Error initializing DevCycle: ${err}`)
                return this
            })

        process.on('exit', () => {
            this.close()
        })
    }

    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    async onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    variable<T extends DVCVariableValue>(user: DVCUser, key: string, defaultValue: T): DVCVariable<T> {
        const incomingUser = castIncomingUser(user)
        // this will throw if type is invalid
        const type = getVariableTypeFromValue(defaultValue, key, this.logger, true)

        if (!this.initialized) {
            this.logger.warn('variable called before DVCClient initialized, returning default value')
            return new DVCVariable({
                defaultValue,
                type,
                key
            })
        }

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.environmentKey)

        const options: VariableParam<T> = {
            key,
            type,
            defaultValue
        }
        const configVariable = bucketedConfig?.variables?.[key]
        let eventType = EventTypes.aggVariableEvaluated
        if (configVariable) {
            if (type === configVariable.type) {
                options.value = configVariable.value as VariableTypeAlias<T>
                options.evalReason = configVariable.evalReason
            } else {
                eventType = EventTypes.aggVariableDefaulted
                this.logger.error(
                    `Type mismatch for variable ${key}. Expected ${type}, got ${configVariable.type}`
                )
            }
        } else {
            eventType = EventTypes.aggVariableDefaulted
        }

        const variable = new DVCVariable(options)

        const variableEvent = {
            type: eventType,
            target: variable.key
        }
        this.eventQueue.queueAggregateEvent(populatedUser, variableEvent, bucketedConfig)

        return variable
    }

    allVariables(user: DVCUser): DVCVariableSet {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn('allVariables called before DVCClient initialized')
            return {}
        }

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.environmentKey)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DVCUser): DVCFeatureSet {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn('allFeatures called before DVCClient initialized')
            return {}
        }

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.environmentKey)
        return bucketedConfig?.features || {}
    }

    track(user: DVCUser, event: DVCEvent): void {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn('track called before DVCClient initialized, event will not be tracked')
            return
        }

        checkParamDefined('type', event.type)
        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        this.eventQueue.queueEvent(populatedUser, event)
    }

    async flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(callback)
    }

    async close(): Promise<void> {
        await this.onInitialized
        this.configHelper.cleanup()
        this.eventQueue.cleanup()
    }
}
