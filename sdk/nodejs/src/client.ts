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
import {
    importBucketingLib,
    getBucketingLib,
    setConfigDataUTF8,
} from './bucketing'
import {
    BucketedUserConfig,
    DevCycleServerSDKOptions,
    DVCLogger,
    getVariableTypeFromValue,
    VariableTypeAlias,
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
} from '@devcycle/js-cloud-server-sdk'
import { DVCPopulatedUserFromDevCycleUser } from './models/populatedUserHelpers'
import { randomUUID } from 'crypto'

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
    typeof import('./open-feature-provider/DevCycleProvider').DevCycleProvider
type DevCycleProvider = InstanceType<DevCycleProviderConstructor>

export class DevCycleClient {
    private clientUUID: string
    private hostname: string
    private sdkKey: string
    private configHelper: EnvironmentConfigManager
    private clientConfigHelper?: EnvironmentConfigManager
    private eventQueue: EventQueue
    private onInitialized: Promise<DevCycleClient>
    private logger: DVCLogger
    private _isInitialized = false
    private openFeatureProvider: DevCycleProvider

    get isInitialized(): boolean {
        return this._isInitialized
    }

    constructor(sdkKey: string, options?: DevCycleServerSDKOptions) {
        // generate UUID for this client
        this.clientUUID = randomUUID()
        this.hostname = `${os.hostname()}_${this.clientUUID}`
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
                    setConfigDataUTF8,
                    setInterval,
                    clearInterval,
                    this.trackSDKConfigEvent.bind(this),
                    options || {},
                )
                if (options?.enableClientBootstrapping) {
                    this.clientConfigHelper = new EnvironmentConfigManager(
                        this.logger,
                        sdkKey,
                        setConfigDataUTF8,
                        setInterval,
                        clearInterval,
                        this.trackSDKConfigEvent.bind(this),
                        { ...options, clientMode: true },
                    )
                }

                this.eventQueue = new EventQueue(sdkKey, {
                    ...options,
                    logger: this.logger,
                })

                const platformData: IPlatformData = {
                    platform: 'NodeJS',
                    platformVersion: process.version,
                    sdkType: 'server',
                    sdkVersion: packageJson.version,
                    hostname: this.hostname,
                }

                getBucketingLib().setPlatformData(JSON.stringify(platformData))

                return Promise.all([
                    this.configHelper.fetchConfigPromise,
                    this.clientConfigHelper?.fetchConfigPromise,
                ])
            })

        this.onInitialized = initializePromise
            .then(() => {
                this.logger.info('DevCycle initialized')
                this._isInitialized = true
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

    async getOpenFeatureProvider(): Promise<DevCycleProvider> {
        let DevCycleProviderClass

        try {
            const importedModule = await import(
                './open-feature-provider/DevCycleProvider.js'
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
        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)

        if (!this._isInitialized) {
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

        if (!this._isInitialized) {
            this.logger.warn(
                'allVariables called before DevCycleClient initialized',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.sdkKey)
        return bucketedConfig?.variables || {}
    }

    allFeatures(user: DevCycleUser): DVCFeatureSet {
        const incomingUser = castIncomingUser(user)

        if (!this._isInitialized) {
            this.logger.warn(
                'allFeatures called before DevCycleClient initialized',
            )
            return {}
        }

        const populatedUser = DVCPopulatedUserFromDevCycleUser(incomingUser)
        const bucketedConfig = bucketUserForConfig(populatedUser, this.sdkKey)
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
        this.eventQueue.queueEvent(populatedUser, event)
    }

    private trackSDKConfigEvent(
        url: string,
        responseTimeMS: number,
        res?: Response,
        err?: ResponseError,
        reqEtag?: string,
        reqLastModified?: string,
    ): void {
        this.eventQueue.queueEvent(
            DVCPopulatedUserFromDevCycleUser({
                user_id: this.hostname,
            }),
            {
                type: 'sdkConfig',
                target: url,
                value: responseTimeMS,
                metaData: {
                    clientUUID: this.clientUUID,
                    reqEtag,
                    reqLastModified,
                    resEtag: res?.headers.get('etag') ?? undefined,
                    resLastModified:
                        res?.headers.get('last-modified') ?? undefined,
                    resRayId: res?.headers.get('cf-ray') ?? undefined,
                    resStatus: (err?.status || res?.status) ?? undefined,
                    errMsg: err?.message ?? undefined,
                },
            },
        )
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

        const clientSDKKey = getSDKKeyFromConfig(`${this.sdkKey}_client`)

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
                ...bucketUserForConfig(populatedUser, `${this.sdkKey}_client`),
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
        return this.eventQueue.flushEvents().then(callback)
    }

    async close(): Promise<void> {
        await this.onInitialized
        await this.flushEvents()
        this.configHelper.cleanup()
        this.eventQueue.cleanup()
    }
}
