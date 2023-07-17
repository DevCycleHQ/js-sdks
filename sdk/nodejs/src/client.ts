import {
    DevCycleOptions,
    DVCVariableValue,
    DVCVariableSet,
    DVCFeatureSet,
    DevCycleEvent,
} from './types'
import { EnvironmentConfigManager } from './environmentConfigManager'
import {
    bucketUserForConfig,
    getVariableTypeCode,
    variableForUser_PB,
} from './utils/userBucketingHelper'
import { DVCVariable, VariableParam } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { EventQueue, EventTypes } from './eventQueue'
import { dvcDefaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import * as packageJson from '../package.json'
import { importBucketingLib, getBucketingLib } from './bucketing'
import {
    DVCLogger,
    getVariableTypeFromValue,
    VariableTypeAlias,
} from '@devcycle/types'
import os from 'os'
import { DevCycleUser } from './models/user'
import { UserError } from './utils/userError'

interface IPlatformData {
    platform: string
    platformVersion: string
    sdkType: string
    sdkVersion: string
    hostname?: string
}

const castIncomingUser = (user: DevCycleUser) => {
    if (!(user instanceof DevCycleUser)) {
        return new DevCycleUser(user)
    }
    return user
}

export class DevCycleClient {
    private sdkKey: string
    private configHelper: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DevCycleClient>
    private logger: DVCLogger
    private initialized = false

    constructor(sdkKey: string, options?: DevCycleOptions) {
        this.sdkKey = sdkKey
        this.logger =
            options?.logger || dvcDefaultLogger({ level: options?.logLevel })

        if (options?.enableEdgeDB) {
            this.logger.info(
                'EdgeDB can only be enabled for the DVC Cloud Client.',
            )
        }

        const initializePromise = importBucketingLib({
            options,
            logger: this.logger,
        })
            .catch((bucketingErr) => {
                throw new UserError(bucketingErr)
            })
            .then(() => {
                this.configHelper = new EnvironmentConfigManager(
                    this.logger,
                    sdkKey,
                    options || {},
                )
                this.eventQueue = new EventQueue(sdkKey, {
                    ...options,
                    logger: this.logger,
                })

                const platformData: IPlatformData = {
                    platform: 'NodeJS',
                    platformVersion: process.version,
                    sdkType: 'server',
                    sdkVersion: packageJson.version,
                    hostname: os.hostname(),
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
                if (err instanceof UserError) {
                    throw err
                }
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
    async onClientInitialized(
        onInitialized?: (err?: Error) => void,
    ): Promise<DevCycleClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    variable<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
    ): DVCVariable<T> {
        const incomingUser = castIncomingUser(user)
        // this will throw if type is invalid
        const type = getVariableTypeFromValue(
            defaultValue,
            key,
            this.logger,
            true,
        )
        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)

        if (!this.initialized) {
            this.logger.warn(
                'variable called before DevCycleClient initialized, returning default value',
            )

            this.eventQueue?.queueAggregateEvent(populatedUser, {
                type: EventTypes.aggVariableDefaulted,
                target: key,
            })

            return new DVCVariable({
                defaultValue,
                type,
                key,
            })
        }

        const configVariable = variableForUser_PB(
            this.sdkKey,
            populatedUser,
            key,
            getVariableTypeCode(type),
        )

        const options: VariableParam<T> = {
            key,
            type,
            defaultValue,
        }
        if (configVariable) {
            if (type === configVariable.type) {
                options.value = configVariable.value as VariableTypeAlias<T>
                options.evalReason = configVariable.evalReason
            } else {
                this.logger.error(
                    `Type mismatch for variable ${key}. Expected ${type}, got ${configVariable.type}`,
                )
            }
        }

        return new DVCVariable(options)
    }

    variableValue<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
    ): VariableTypeAlias<T> {
        return this.variable(user, key, defaultValue).value
    }

    allVariables(user: DevCycleUser): DVCVariableSet {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn(
                'allVariables called before DevCycleClient initialized',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.sdkKey)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DevCycleUser): DVCFeatureSet {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn(
                'allFeatures called before DevCycleClient initialized',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.sdkKey)
        return bucketedConfig?.features || {}
    }

    track(user: DevCycleUser, event: DevCycleEvent): void {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn(
                'track called before DevCycleClient initialized, event will not be tracked',
            )
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
        await this.flushEvents()
        this.configHelper.cleanup()
        this.eventQueue.cleanup()
    }
}
