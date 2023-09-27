import { EnvironmentConfigManager } from '@devcycle/config-manager'
import {
    ConfigBody,
    DVCLogger,
    getVariableTypeFromValue,
    VariableTypeAlias,
} from '@devcycle/types'
import {
    DevCycleUser,
    DVCVariable,
    VariableParam,
    checkParamDefined,
    dvcDefaultLogger,
    DVCVariableValue,
    DVCVariableSet,
    DVCFeatureSet,
    DevCycleEvent,
    DevCycleCloudOptions,
} from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from './models/populatedUserHelpers'
import { UserError } from '@devcycle/server-request'
import { generateBucketedConfig } from '@devcycle/bucketing'

const castIncomingUser = (user: DevCycleUser) => {
    if (!(user instanceof DevCycleUser)) {
        return new DevCycleUser(user)
    }
    return user
}

export class DevCycleEdgeClient {
    private options: DevCycleCloudOptions
    private configHelper: EnvironmentConfigManager
    private onInitialized: Promise<DevCycleEdgeClient>
    private logger: DVCLogger
    private initialized = false
    private configData: ConfigBody

    constructor(sdkKey: string, options: DevCycleCloudOptions = {}) {
        this.options = options
        this.logger =
            options?.logger || dvcDefaultLogger({ level: options?.logLevel })

        if (options?.enableEdgeDB) {
            this.logger.info(
                'EdgeDB can only be enabled for the DVC Cloud Client.',
            )
        }

        this.configHelper = new EnvironmentConfigManager(
            this.logger,
            sdkKey,
            this.setConfigData.bind(this),
            setInterval,
            clearInterval,
            options || {},
        )

        this.onInitialized = this.configHelper.fetchConfigPromise
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

        // process.on('exit', () => {
        //     this.close()
        // })
    }

    setConfigData(sdkKey: string, projectConfigStr: string): void {
        this.configData = JSON.parse(projectConfigStr) as ConfigBody
    }

    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    async onClientInitialized(
        onInitialized?: (err?: Error) => void,
    ): Promise<DevCycleEdgeClient> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    async variable<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
    ): Promise<DVCVariable<T>> {
        await this.onInitialized

        const incomingUser = castIncomingUser(user)
        // this will throw if type is invalid
        const type = getVariableTypeFromValue(
            defaultValue,
            key,
            this.logger,
            true,
        )
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.options,
        )
        const bucketedConfig = generateBucketedConfig({
            config: this.configData,
            user: populatedUser,
        })
        const configVariable = bucketedConfig?.variables?.[key]

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

    async variableValue<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
    ): Promise<VariableTypeAlias<T>> {
        return (await this.variable(user, key, defaultValue)).value
    }

    async allVariables(user: DevCycleUser): Promise<DVCVariableSet> {
        await this.onInitialized

        const incomingUser = castIncomingUser(user)
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.options,
        )
        const bucketedConfig = generateBucketedConfig({
            config: this.configData,
            user: populatedUser,
        })
        return bucketedConfig?.variables || {}
    }

    async allFeatures(user: DevCycleUser): Promise<DVCFeatureSet> {
        await this.onInitialized

        const incomingUser = castIncomingUser(user)
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.options,
        )
        const bucketedConfig = generateBucketedConfig({
            config: this.configData,
            user: populatedUser,
        })
        return bucketedConfig?.features || {}
    }

    async track(user: DevCycleUser, event: DevCycleEvent): Promise<void> {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn(
                'track called before DevCycleClient initialized, event will not be tracked',
            )
            return
        }

        checkParamDefined('type', event.type)
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.options,
        )
        // this.eventQueue.queueEvent(populatedUser, event)
    }

    async flushEvents(callback?: () => void): Promise<void> {
        // return this.eventQueue.flushEvents().then(callback)
    }

    async close(): Promise<void> {
        await this.onInitialized
        await this.flushEvents()
        this.configHelper.cleanup()
        // this.eventQueue.cleanup()
    }
}
