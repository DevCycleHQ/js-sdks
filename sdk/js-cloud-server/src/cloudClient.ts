import {
    DVCVariableValue,
    DVCVariableSet,
    DVCFeatureSet,
    DevCycleEvent,
} from './types'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { dvcDefaultLogger } from './utils/logger'
import {
    DVCPopulatedUser,
    DevCyclePlatformDetails,
} from './models/populatedUser'
import {
    DEFAULT_REASON_DETAILS,
    DevCycleServerSDKOptions,
    DVCLogger,
    EVAL_REASONS,
    getVariableTypeFromValue,
    InferredVariableType,
    VariableDefinitions,
    VariableTypeAlias,
} from '@devcycle/types'
import {
    getAllFeatures,
    getAllVariables,
    getVariable,
    postTrack,
} from './request'
import { DevCycleUser } from './models/user'
import { ResponseError } from '@devcycle/server-request'
import { EvalHooksRunner } from './hooks/EvalHooksRunner'
import { EvalHook } from './hooks/EvalHook'
import { DevCycleCloudOptions } from '.'

const castIncomingUser = (user: DevCycleUser) => {
    if (!(user instanceof DevCycleUser)) {
        return new DevCycleUser(user)
    }
    return user
}

/**
 * Handle response errors from API
 * Suppress 5xx errors and log them instead while returning defaults to the caller
 * Throw 4XX errors back to the caller to notify of invalid SDK usage
 * Special handling of 404 error, which indicates "variable not found"
 * @param err
 */
const throwIfUserError = (err: unknown) => {
    if (err instanceof ResponseError) {
        const code = err.status

        // throw the error if it indicates there was user error in this call
        // (e.g. invalid auth credentials or bad user data)
        if (code !== 404 && code < 500) {
            throw new Error(
                `DevCycle request failed with status ${code}. ${
                    err.message || ''
                }`,
            )
        }

        // Catch non-4xx errors so we can log them instead
        return
    }

    if (err instanceof SyntaxError) {
        // JSON parse error, log instead of throwing
        return
    }

    // if not a ResponseError, throw it
    throw err
}

export class DevCycleCloudClient<
    Variables extends VariableDefinitions = VariableDefinitions,
> {
    private sdkKey: string
    protected logger: DVCLogger
    private options: DevCycleCloudOptions
    protected platformDetails: DevCyclePlatformDetails
    private hooksRunner: EvalHooksRunner

    constructor(
        sdkKey: string,
        options: DevCycleCloudOptions,
        platformDetails: DevCyclePlatformDetails,
    ) {
        this.sdkKey = sdkKey
        this.logger =
            options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.options = options
        this.platformDetails = platformDetails
        this.hooksRunner = new EvalHooksRunner(options.hooks)
        this.logger.info('Running DevCycle NodeJS SDK in Cloud Bucketing mode')
    }

    /**
     * Always returns true for Cloud Client because once the client is created,
     * it is initialized as all request are async to the API.
     */
    get isInitialized(): boolean {
        return true
    }

    async variable<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(user: DevCycleUser, key: K, defaultValue: T): Promise<DVCVariable<T>> {
        return this.hooksRunner.runHooksForEvaluation(
            user,
            key,
            defaultValue,
            async (context) =>
                this._variable(context?.user ?? user, key, defaultValue),
        )
    }

    async _variable<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(user: DevCycleUser, key: K, defaultValue: T): Promise<DVCVariable<T>> {
        const incomingUser = castIncomingUser(user)
        const populatedUser = DVCPopulatedUser.fromDVCUser(
            incomingUser,
            this.platformDetails,
        )

        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        const type = getVariableTypeFromValue(
            defaultValue,
            key,
            this.logger,
            true,
        )

        try {
            const res = await getVariable(
                populatedUser,
                this.sdkKey,
                key,
                this.options,
            )
            const variableResponse: any = await res.json()
            if (variableResponse.type !== type) {
                this.logger.error(
                    `Type mismatch for variable ${key}. Expected ${type}, got ${variableResponse.type}`,
                )
                // Default Variable
                return new DVCVariable({
                    key,
                    type,
                    defaultValue,
                    eval: {
                        reason: EVAL_REASONS.DEFAULT,
                        details: DEFAULT_REASON_DETAILS.TYPE_MISMATCH,
                    },
                })
            }

            return new DVCVariable({
                key,
                type,
                defaultValue,
                value: variableResponse.value as VariableTypeAlias<T>,
                eval: variableResponse.eval,
            })
        } catch (err) {
            throwIfUserError(err)
            if (err instanceof ResponseError && err.status !== 404) {
                this.logger.error(
                    `Request to get variable: ${key} failed with response message: ${
                        (err as any).message
                    }`,
                )
            }
            // Default Variable
            return new DVCVariable({
                key,
                type,
                defaultValue,
                eval: {
                    reason: EVAL_REASONS.DEFAULT,
                    details: DEFAULT_REASON_DETAILS.ERROR,
                },
            })
        }
    }

    async variableValue<
        K extends string & keyof Variables,
        T extends DVCVariableValue & Variables[K],
    >(
        user: DevCycleUser,
        key: K,
        defaultValue: T,
    ): Promise<InferredVariableType<K, T>> {
        return (await this.variable(user, key, defaultValue)).value
    }

    async allVariables(user: DevCycleUser): Promise<DVCVariableSet> {
        const incomingUser = castIncomingUser(user)

        const populatedUser = DVCPopulatedUser.fromDVCUser(
            incomingUser,
            this.platformDetails,
        )

        try {
            const res = await getAllVariables(
                populatedUser,
                this.sdkKey,
                this.options,
            )
            const variablesResponse = await res.json()
            return (variablesResponse || {}) as DVCVariableSet
        } catch (err) {
            throwIfUserError(err)
            this.logger.error(
                `Request to get all variable failed with response message: ${
                    (err as any).message
                }`,
            )
            return {} as DVCVariableSet
        }
    }

    async allFeatures(user: DevCycleUser): Promise<DVCFeatureSet> {
        const incomingUser = castIncomingUser(user)

        const populatedUser = DVCPopulatedUser.fromDVCUser(
            incomingUser,
            this.platformDetails,
        )

        try {
            const res = await getAllFeatures(
                populatedUser,
                this.sdkKey,
                this.options,
            )
            const featuresResponse = await res.json()
            return (featuresResponse || {}) as DVCFeatureSet
        } catch (err) {
            throwIfUserError(err)
            this.logger.error(
                `Request to get all features failed with response message: ${
                    (err as any).message
                }`,
            )
            return {} as DVCFeatureSet
        }
    }

    async track(user: DevCycleUser, event: DevCycleEvent): Promise<void> {
        const incomingUser = castIncomingUser(user)

        if (
            event === undefined ||
            event === null ||
            typeof event.type !== 'string' ||
            event.type.length === 0
        ) {
            throw new Error('Invalid Event')
        }
        checkParamDefined('type', event.type)
        const populatedUser = DVCPopulatedUser.fromDVCUser(
            incomingUser,
            this.platformDetails,
        )
        try {
            await postTrack(populatedUser, event, this.sdkKey, this.options)
            this.logger.debug('DVC Event Tracked')
        } catch (err) {
            throwIfUserError(err)
            this.logger.error(
                `DVC Error Tracking Event. Response message: ${
                    (err as any).message
                }`,
            )
        }
    }

    async addHook(hook: EvalHook): Promise<void> {
        this.hooksRunner.enqueue(hook)
    }

    async clearHooks(): Promise<void> {
        this.hooksRunner.clear()
    }
}
