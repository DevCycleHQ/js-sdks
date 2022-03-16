import {
    DVCOptions,
    DVCVariableValue,
    DVCVariable as DVCVariableInterface,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent,
    DVCLogger,
    DVCUser
} from './types'
import { EnvironmentConfigManager } from './environmentConfigManager'
import { bucketUserForConfig } from './utils/userBucketingHelper'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { EventTypes } from './models/requestEvent'
import { EventQueue } from './eventQueue'
import { defaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'

export class DVCClient {
    private environmentKey: string
    private options?: DVCOptions
    private configHelper: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DVCClient>
    private logger: DVCLogger

    constructor(environmentKey: string, options?: DVCOptions) {
        this.environmentKey = environmentKey
        this.options = options
        this.logger = options?.logger || defaultLogger()
        this.configHelper = new EnvironmentConfigManager(this.logger, environmentKey, options || {})
        this.eventQueue = new EventQueue(this.logger, environmentKey, options?.flushEventsMS)

        this.onInitialized = this.configHelper.fetchConfigPromise
            .then(() => {
                this.logger.info('DevCycle initialized')
                return this
            })
            .catch((err) => {
                this.logger.error(`Error initializing DevCycle: ${err}`)
                return this
            })

        process.on('exit', () => {
            this.configHelper.cleanup()
        })
    }

    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): DVCVariableInterface {
        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.configHelper?.config)

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
        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.configHelper?.config)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DVCUser): DVCFeatureSet {
        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.configHelper?.config)
        return bucketedConfig?.features || {}
    }

    track(user: DVCUser, event: DVCEvent): void {
        checkParamDefined('type', event.type)
        const requestUser = new DVCPopulatedUser(user)
        const bucketedConfig = bucketUserForConfig(requestUser, this.configHelper?.config)
        this.eventQueue.queueEvent(requestUser, event, bucketedConfig)
    }

    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(callback)
    }
}
