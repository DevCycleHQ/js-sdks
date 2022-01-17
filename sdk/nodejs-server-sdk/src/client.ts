import {
    DVCClient as DVCClientInterface,
    DVCUser,
    DVCOptions,
    DVCVariableValue,
    DVCVariable as DVCVariableInterface,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent,
    DVCLogger
} from '../types'
import { EnvironmentConfigManager } from './environmentConfigManager'
import { bucketUserForConfig } from './utils/userBucketingHelper'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { EventTypes } from './models/requestEvent'
import { EventQueue } from './eventQueue'
import { defaultLogger } from './utils/logger'

export class DVCClient implements DVCClientInterface {
    environmentKey: string
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

    onClientInitialized(onInitialized?: (err?: Error) => void): Promise<DVCClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): DVCVariableInterface {
        const bucketedConfig = bucketUserForConfig(user, this.configHelper?.config)

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
        this.eventQueue.queueAggregateEvent(user, variableEvent, bucketedConfig)

        return variable
    }

    allVariables(user: DVCUser): DVCVariableSet {
        const bucketedConfig = bucketUserForConfig(user, this.configHelper?.config)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DVCUser): DVCFeatureSet {
        const bucketedConfig = bucketUserForConfig(user, this.configHelper?.config)
        return bucketedConfig?.features || {}
    }

    track(user: DVCUser, event: DVCEvent) {
        checkParamDefined('type', event.type)
        const bucketedConfig = bucketUserForConfig(user, this.configHelper?.config)
        this.eventQueue.queueEvent(user, event, bucketedConfig)
    }

    flushEvents(callback?: () => void): Promise<void> {
        return this.eventQueue.flushEvents().then(callback)
    }
}
