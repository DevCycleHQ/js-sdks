import { EnvironmentConfigManager } from '@devcycle/config-manager'
import { ResponseError } from '@devcycle/server-request'
import {
    bucketUserForConfig,
    getSDKKeyFromConfig,
    getVariableTypeCode,
    variableForUser_PB,
} from './utils/userBucketingHelper'
import { EventQueue, EventTypes } from './eventQueue'
import { importBucketingLib, setConfigDataUTF8 } from './bucketing'
import {
    BucketedUserConfig,
    DevCycleServerSDKOptions,
    DVCLogger,
    getVariableTypeFromValue,
    VariableTypeAlias,
    UserError,
    VariableDefinitions,
    InferredVariableType,
    DVCCustomDataJSON,
} from '@devcycle/types'
import os from 'os'
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
    DVCPopulatedUser,
    DevCyclePlatformDetails,
} from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from './models/populatedUserHelpers'
import { randomUUID } from 'crypto'
import { DevCycleOptionsLocalEnabled } from './index'
import { WASMBucketingExports } from '@devcycle/bucketing-assembly-script'
import { getNodeJSPlatformDetails } from './utils/platformDetails'
import { DevCycleProvider } from './open-feature/DevCycleProvider'

const castIncomingUser = (user: DevCycleUser) => {
    if (!(user instanceof DevCycleUser)) {
        return new DevCycleUser(user)
    }
    return user
}

export class DevCycleClient<
    Variables extends VariableDefinitions = VariableDefinitions,
> {
    private clientUUID: string
    private hostname: string
    private sdkKey: string
    private configHelper?: EnvironmentConfigManager
    private clientConfigHelper?: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DevCycleClient<Variables>>
    private logger: DVCLogger
    private _isInitialized = false
    private openFeatureProvider: DevCycleProvider
    private bucketingLib: WASMBucketingExports
    private bucketingTracker?: NodeJS.Timeout
    private bucketingImportPromise: Promise<void>
    private platformDetails: DevCyclePlatformDetails
    private sdkPlatform?: string

    get isInitialized(): boolean {
        return this._isInitialized
    }

    constructor(sdkKey: string, options?: DevCycleOptionsLocalEnabled) {
        this.clientUUID = randomUUID()
        this.hostname = os.hostname()
        this.sdkKey = sdkKey
        this.sdkPlatform = options?.sdkPlatform

        this.logger =
            options?.logger || dvcDefaultLogger({ level: options?.logLevel })

        if (options?.enableEdgeDB) {
            this.logger.info(
                'EdgeDB can only be enabled for the DVC Cloud Client.',
            )
        }

        this.bucketingImportPromise = this.initializeBucketing({
            options,
        }).catch((bucketingErr) => {
            throw new UserError(bucketingErr)
        })

        const initializePromise = this.bucketingImportPromise.then(() => {
            this.configHelper = new EnvironmentConfigManager(
                this.logger,
                sdkKey,
                (sdkKey: string, projectConfig: string) =>
                    setConfigDataUTF8(this.bucketingLib, sdkKey, projectConfig),
                setInterval,
                clearInterval,
                this.trackSDKConfigEvent.bind(this),
                options || {},
                options?.configSource,
            )
            if (options?.enableClientBootstrapping) {
                this.clientConfigHelper = new EnvironmentConfigManager(
                    this.logger,
                    sdkKey,
                    (sdkKey: string, projectConfig: string) =>
                        setConfigDataUTF8(
                            this.bucketingLib,
                            sdkKey,
                            projectConfig,
                        ),
                    setInterval,
                    clearInterval,
                    this.trackSDKConfigEvent.bind(this),
                    { ...options, clientMode: true },
                    options?.configSource,
                )
            }

            this.eventQueue = new EventQueue(
                sdkKey,
                this.clientUUID,
                this.bucketingLib,
                {
                    ...options,
                    logger: this.logger,
                },
            )

            this.setPlatformDataInBucketingLib()

            return Promise.all([
                this.configHelper.fetchConfigPromise,
                this.clientConfigHelper?.fetchConfigPromise,
            ])
        })

        this.onInitialized = initializePromise
            .then(() => {
                this.logger.info('DevCycle initialized')
                return this
            })
            .catch((err) => {
                this.logger.error(`Error initializing DevCycle: ${err}`)
                if (err instanceof UserError) {
                    throw err
                }
                return this
            })
            .finally(() => {
                this._isInitialized = true
            })

        process.on('exit', () => {
            this.close()
        })
    }

    private setPlatformDataInBucketingLib(): void {
        if (!this.bucketingLib) return

        this.platformDetails = getNodeJSPlatformDetails()
        if (this.sdkPlatform || this.openFeatureProvider) {
            this.platformDetails.sdkPlatform = this.sdkPlatform ?? 'nodejs-of'
        }
        this.bucketingLib.setPlatformData(JSON.stringify(this.platformDetails))
    }

    async initializeBucketing({
        options,
    }: {
        options?: DevCycleServerSDKOptions
    }): Promise<void> {
        ;[this.bucketingLib, this.bucketingTracker] = await importBucketingLib({
            options,
            logger: this.logger,
        })
    }

    async getOpenFeatureProvider(): Promise<DevCycleProvider> {
        if (this.openFeatureProvider) return this.openFeatureProvider

        this.openFeatureProvider = new DevCycleProvider(this, {
            logger: this.logger,
        })
        this.setPlatformDataInBucketingLib()
        return this.openFeatureProvider
    }

    /**
     * Notify the user when Features have been loaded from the server.
     * An optional callback can be passed in, and will return a promise if no callback has been passed in.
     *
     * @param onInitialized
     */
    async onClientInitialized(
        onInitialized?: (err?: Error) => void,
    ): Promise<DevCycleClient<Variables>> {
        if (onInitialized && typeof onInitialized === 'function') {
            this.onInitialized
                .then(() => onInitialized())
                .catch((err) => onInitialized(err))
        }
        return this.onInitialized
    }

    variable<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(user: DevCycleUser, key: K, defaultValue: T): DVCVariable<T> {
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
            this.platformDetails,
        )

        if (!this.configHelper?.hasConfig) {
            this.logger.warn(
                'variable called before DevCycleClient has config, returning default value',
            )

            this.queueAggregateEvent(populatedUser, {
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
            this.bucketingLib,
            this.sdkKey,
            populatedUser,
            key,
            getVariableTypeCode(this.bucketingLib, type),
        )

        const options: VariableParam<T> = {
            key,
            type,
            defaultValue,
        }
        if (configVariable) {
            if (type === configVariable.type) {
                options.value = configVariable.value as VariableTypeAlias<T>
                options.evalReason = configVariable.eval?.reason
            } else {
                this.logger.error(
                    `Type mismatch for variable ${key}. Expected ${type}, got ${configVariable.type}`,
                )
            }
        }

        return new DVCVariable(options)
    }

    variableValue<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(user: DevCycleUser, key: K, defaultValue: T): InferredVariableType<K, T> {
        return this.variable(user, key, defaultValue).value
    }

    allVariables(user: DevCycleUser): DVCVariableSet {
        const incomingUser = castIncomingUser(user)

        if (!this.configHelper?.hasConfig) {
            this.logger.warn(
                'allVariables called before DevCycleClient has config',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.platformDetails,
        )
        const bucketedConfig = bucketUserForConfig(
            this.bucketingLib,
            populatedUser,
            this.sdkKey,
        )
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DevCycleUser): DVCFeatureSet {
        const incomingUser = castIncomingUser(user)

        if (!this.configHelper?.hasConfig) {
            this.logger.warn(
                'allFeatures called before DevCycleClient has config',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.platformDetails,
        )
        const bucketedConfig = bucketUserForConfig(
            this.bucketingLib,
            populatedUser,
            this.sdkKey,
        )
        return bucketedConfig?.features || {}
    }

    track(user: DevCycleUser, event: DevCycleEvent): void {
        const incomingUser = castIncomingUser(user)

        if (!this._isInitialized) {
            this.logger.warn(
                'track called before DevCycleClient initialized, event will not be tracked',
            )
            return
        }

        checkParamDefined('type', event.type)
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            incomingUser,
            this.platformDetails,
        )
        this.queueEvent(populatedUser, event)
    }

    private queueEvent(populatedUser: DVCPopulatedUser, event: DevCycleEvent) {
        // we need the config in order to queue events since we need to know the featureVars
        this.onInitialized.then(() => {
            this.eventQueue.queueEvent(populatedUser, event)
        })
    }

    private queueAggregateEvent(
        populatedUser: DVCPopulatedUser,
        event: DevCycleEvent,
    ) {
        // we don't need the config for aggregate events since there are no featureVars stored, so just wait until
        // bucketing lib itself is initialized
        this.bucketingImportPromise.then(() => {
            this.eventQueue.queueAggregateEvent(populatedUser, event)
        })
    }

    private trackSDKConfigEvent(
        url: string,
        responseTimeMS: number,
        metaData?: Record<string, unknown>,
        err?: ResponseError,
        reqEtag?: string,
        reqLastModified?: string,
        sseConnected?: boolean,
    ): void {
        const populatedUser = DVCPopulatedUserFromDevCycleUser(
            { user_id: `${this.clientUUID}@${this.hostname}` },
            this.platformDetails,
        )

        this.queueEvent(populatedUser, {
            type: 'sdkConfig',
            target: url,
            value: responseTimeMS,
            metaData: {
                clientUUID: this.clientUUID,
                reqEtag,
                reqLastModified,
                ...metaData,
                resStatus: metaData?.resStatus ?? err?.status ?? undefined,
                errMsg: err?.message ?? undefined,
                sseConnected: sseConnected ?? undefined,
            },
        })
    }

    /**
     * Call this to obtain a config that is suitable for use in the "bootstrapConfig" option of client-side JS SDKs
     * Useful for serverside-rendering use cases where the server performs the initial rendering pass, and provides it
     * to the client along with the DevCycle config to allow hydration
     * @param user
     * @param userAgent
     */
    async getClientBootstrapConfig(
        user: DevCycleUser,
        userAgent: string,
    ): Promise<BucketedUserConfig & { clientSDKKey: string }> {
        const incomingUser = castIncomingUser(user)

        await this.onInitialized

        if (!this.clientConfigHelper) {
            throw new Error(
                'enableClientBootstrapping option must be set to true to use getClientBootstrapConfig',
            )
        }

        const clientSDKKey = getSDKKeyFromConfig(
            this.bucketingLib,
            `${this.sdkKey}_client`,
        )

        if (!clientSDKKey) {
            throw new Error(
                'Client bootstrapping config is malformed. Please contact DevCycle support.',
            )
        }

        try {
            const { generateClientPopulatedUser } = await import(
                './clientUser.js'
            )
            const populatedUser = await generateClientPopulatedUser(
                incomingUser,
                userAgent,
            )
            return {
                ...bucketUserForConfig(
                    this.bucketingLib,
                    populatedUser,
                    `${this.sdkKey}_client`,
                ),
                clientSDKKey,
            }
        } catch (e) {
            throw new Error(
                '@devcycle/js-client-sdk package could not be found. ' +
                    'Please install it to use client boostrapping. Error: ' +
                    e.message,
            )
        }
    }

    async flushEvents(callback?: () => void): Promise<void> {
        return this.bucketingImportPromise.then(() =>
            this.eventQueue.flushEvents().then(callback),
        )
    }

    async close(): Promise<void> {
        await this.onInitialized
        await this.flushEvents()
        this.configHelper?.cleanup()
        this.eventQueue.cleanup()
        clearInterval(this.bucketingTracker)
    }

    setClientCustomData(clientCustomData: DVCCustomDataJSON): void {
        if (!this.bucketingLib) return
        this.bucketingLib.setClientCustomData(
            this.sdkKey,
            JSON.stringify(clientCustomData),
        )
    }
}
