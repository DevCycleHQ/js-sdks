import {
    DVCOptions,
    DVCVariableValue,
    DVCVariable as DVCVariableInterface,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent,
    DVCUser
} from './types'
import { EnvironmentConfigManager } from './environmentConfigManager'
import { bucketUserForConfig } from './utils/userBucketingHelper'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { EventTypes } from './models/requestEvent'
import { EventQueue } from './eventQueue'
import { dvcDefaultLogger, DVCLogger } from '@devcycle/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import * as packageJson from '../package.json'
import { importBucketingLib, getBucketingLib } from './bucketing'

interface IPlatformData {
    platform: string
    platformVersion: string
    sdkType: string
    sdkVersion: string
}

export class DVCClient {
    private environmentKey: string
    private options?: DVCOptions
    private configHelper: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DVCClient>
    private logger: DVCLogger
    private initialized = false

    constructor(environmentKey: string, options?: DVCOptions) {
        this.environmentKey = environmentKey
        this.options = options
        this.logger = options?.logger || dvcDefaultLogger({ level: options?.logLevel })

        const initializePromise = importBucketingLib()
            .then(() => {
                this.configHelper = new EnvironmentConfigManager(this.logger, environmentKey, options || {})
                this.eventQueue = new EventQueue(this.logger, environmentKey, options?.flushEventsMS)

                const platformData: IPlatformData = {
                    platform: 'NodeJS',
                    platformVersion: process.version,
                    sdkType: 'server',
                    sdkVersion: packageJson.version
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
            this.configHelper?.cleanup()
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

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): DVCVariableInterface {
        if (!this.initialized) {
            this.logger.warn('variable called before DVCClient initialized, returning default value')
            return new DVCVariable({
                value: defaultValue,
                defaultValue,
                key
            })
        }

        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.environmentKey)

        const variable = new DVCVariable({
            ...bucketedConfig?.variables?.[key],
            key,
            defaultValue
        })

        const variableEvent = {
            type: variable.value === variable.defaultValue
                ? EventTypes.variableDefaulted
                : EventTypes.variableEvaluated,
            target: variable.key
        }
        this.eventQueue.queueAggregateEvent(requestUser, variableEvent, bucketedConfig)

        return variable
    }

    allVariables(user: DVCUser): DVCVariableSet {
        if (!this.initialized) {
            this.logger.warn('allVariables called before DVCClient initialized')
            return {}
        }

        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.environmentKey)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DVCUser): DVCFeatureSet {
        if (!this.initialized) {
            this.logger.warn('allFeatures called before DVCClient initialized')
            return {}
        }

        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.environmentKey)
        return bucketedConfig?.features || {}
    }

    track(user: DVCUser, event: DVCEvent): void {
        if (!this.initialized) {
            this.logger.warn('track called before DVCClient initialized, event will not be tracked')
            return
        }

        checkParamDefined('type', event.type)
        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.environmentKey)
        this.eventQueue.queueEvent(requestUser, event, bucketedConfig)
    }

    async flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(callback)
    }
}
