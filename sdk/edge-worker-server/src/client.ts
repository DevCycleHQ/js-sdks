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
    dvcDefaultLogger,
    DVCVariableValue,
    DVCVariableSet,
    DVCFeatureSet,
    DevCycleCloudOptions,
} from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from './models/populatedUserHelpers'
import {
    UserError,
    DevCycleEvent,
    checkParamDefined,
    EventTypes,
} from '@devcycle/server-request'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { generateAggEvent, publishDevCycleEvents } from './eventsPublisher'
import isArray from 'lodash/isArray'

const castIncomingUser = (user: DevCycleUser) => {
    if (!(user instanceof DevCycleUser)) {
        return new DevCycleUser(user)
    }
    return user
}

export class DevCycleEdgeClient {
    private sdkKey: string
    private options: DevCycleCloudOptions
    private configHelper: EnvironmentConfigManager
    private onInitialized: Promise<DevCycleEdgeClient>
    private logger: DVCLogger
    private initialized = false
    private configData: ConfigBody

    constructor(sdkKey: string, options: DevCycleCloudOptions = {}) {
        this.sdkKey = sdkKey
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

        const dvcVariable = new DVCVariable(options)

        const aggEvent = generateAggEvent(
            populatedUser.user_id,
            dvcVariable.isDefaulted
                ? EventTypes.aggVariableDefaulted
                : EventTypes.aggVariableEvaluated,
            key,
            bucketedConfig.variableVariationMap,
        )
        // Don't await for the event to be published to the Events API
        publishDevCycleEvents(
            this.logger,
            this.sdkKey,
            populatedUser,
            [aggEvent],
            bucketedConfig.featureVariationMap,
        )

        return dvcVariable
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

    private static checkDevCycleEvent(event: DevCycleEvent): void {
        checkParamDefined('type', event.type)
    }

    async track(
        user: DevCycleUser,
        event: DevCycleEvent | DevCycleEvent[],
    ): Promise<void> {
        const incomingUser = castIncomingUser(user)

        if (!this.initialized) {
            this.logger.warn(
                'track called before DevCycleClient initialized, event will not be tracked',
            )
            return
        }

        if (isArray(event)) {
            event.forEach(DevCycleEdgeClient.checkDevCycleEvent)
        } else {
            DevCycleEdgeClient.checkDevCycleEvent(event)
        }
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.options,
        )
        const bucketedConfig = generateBucketedConfig({
            config: this.configData,
            user: populatedUser,
        })

        await publishDevCycleEvents(
            this.logger,
            this.sdkKey,
            populatedUser,
            isArray(event) ? event : [event],
            bucketedConfig.featureVariationMap,
        )
    }

    async close(): Promise<void> {
        await this.onInitialized
        this.configHelper.cleanup()
    }
}
