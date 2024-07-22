import { EnvironmentConfigManager } from '@devcycle/config-manager'
import { ResponseError, UserError } from '@devcycle/server-request'
import {
    bucketUserForConfig,
    getSDKKeyFromConfig,
    getVariableTypeCode,
    variableForUser_PB,
} from './utils/userBucketingHelper'
import { EventQueue, EventTypes } from './eventQueue'
import * as packageJson from '../package.json'
import { importBucketingLib, setConfigDataUTF8 } from './bucketing'
import {
    BucketedUserConfig,
    DevCycleServerSDKOptions,
    DVCLogger,
    getVariableTypeFromValue,
    VariableTypeAlias,
    type VariableValue,
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
} from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from './models/populatedUserHelpers'
import { randomUUID } from 'crypto'
import { DevCycleOptionsLocalEnabled } from './index'
import { WASMBucketingExports } from '@devcycle/bucketing-assembly-script'

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

// Dynamically import the OpenFeature Provider, as it's an optional peer dependency
type DevCycleProviderConstructor =
    typeof import('./open-feature/DevCycleProvider').DevCycleProvider
type DevCycleProvider = InstanceType<DevCycleProviderConstructor>

export interface VariableDefinitions {
    [key: string]: VariableValue
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
    private bucketingTracker?: NodeJS.Timer
    private bucketingImportPromise: Promise<void>

    get isInitialized(): boolean {
        return this._isInitialized
    }

    constructor(sdkKey: string, options?: DevCycleOptionsLocalEnabled) {
        this.clientUUID = randomUUID()
        this.hostname = os.hostname()
        this.sdkKey = sdkKey

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

            const platformData: IPlatformData = {
                platform: 'NodeJS',
                platformVersion: process.version,
                sdkType: 'server',
                sdkVersion: packageJson.version,
                hostname: this.hostname,
            }

            this.bucketingLib.setPlatformData(JSON.stringify(platformData))

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
        let DevCycleProviderClass

        try {
            const importedModule = await import(
                './open-feature/DevCycleProvider.js'
            )
            DevCycleProviderClass = importedModule.DevCycleProvider
        } catch (error) {
            throw new Error(
                'Missing "@openfeature/server-sdk" and/or "@openfeature/core" ' +
                    'peer dependencies to get OpenFeature Provider',
            )
        }

        if (this.openFeatureProvider) return this.openFeatureProvider

        this.openFeatureProvider = new DevCycleProviderClass(this, {
            logger: this.logger,
        })
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
        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)

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
                options.evalReason = configVariable.evalReason
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
    >(user: DevCycleUser, key: K, defaultValue: T): VariableTypeAlias<T> {
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

        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)
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

        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)
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
        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)
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
        const populatedUser = DVCPopulatedUserFromDevCycleUser({
            user_id: `${this.clientUUID}@${this.hostname}`,
        })

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
            const populatedUser = generateClientPopulatedUser(
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
}
