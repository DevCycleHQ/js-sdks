import {
    Provider,
    ResolutionDetails,
    EvaluationContext,
    JsonValue,
    EvaluationContextValue,
    ProviderMetadata,
    StandardResolutionReasons,
    ParseError,
    TargetingKeyMissingError,
    InvalidContextError,
    ProviderStatus,
    Tracking,
    TrackingEventDetails,
} from '@openfeature/server-sdk'
import {
    DevCycleClient,
    DevCycleCloudClient,
    DevCycleOptions,
    DVCVariableInterface,
    DevCycleUser,
    DVCJSON,
    DVCCustomDataJSON,
    dvcDefaultLogger,
} from '../index'
import { DVCLogger, VariableValue } from '@devcycle/types'

const DVCKnownPropertyKeyTypes: Record<string, string> = {
    email: 'string',
    name: 'string',
    language: 'string',
    country: 'string',
    appVersion: 'string',
    appBuild: 'number',
    customData: 'object',
    privateCustomData: 'object',
}

type EvaluationContextObject = {
    [key: string]: EvaluationContextValue
}

export class DevCycleProvider implements Provider, Tracking {
    readonly metadata: ProviderMetadata = {
        name: 'devcycle-nodejs-provider',
    } as const

    readonly runsOn = 'server'

    private readonly logger: DVCLogger

    constructor(
        private readonly devcycleClient: DevCycleClient | DevCycleCloudClient,
        options: Pick<DevCycleOptions, 'logger' | 'logLevel'> = {},
    ) {
        this.logger =
            options.logger ?? dvcDefaultLogger({ level: options.logLevel })
    }

    get status(): ProviderStatus {
        return this.devcycleClient.isInitialized
            ? ProviderStatus.READY
            : ProviderStatus.NOT_READY
    }

    async initialize(context?: EvaluationContext): Promise<void> {
        if (this.devcycleClient instanceof DevCycleCloudClient) return

        await this.devcycleClient.onClientInitialized()
    }

    async onClose(): Promise<void> {
        if (this.devcycleClient instanceof DevCycleCloudClient) return

        await this.devcycleClient.close()
    }

    track(
        trackingEventName: string,
        context?: EvaluationContext,
        trackingEventDetails?: TrackingEventDetails,
    ): void {
        const user_id = context?.targetingKey ?? context?.user_id
        if (!context || !user_id) {
            throw new TargetingKeyMissingError(
                'Missing targetingKey or user_id in context',
            )
        }

        this.devcycleClient.track(this.devcycleUserFromContext(context), {
            type: trackingEventName,
            value: trackingEventDetails?.value,
            metaData: trackingEventDetails && {
                ...trackingEventDetails,
                value: undefined,
            },
        })
    }

    /**
     * Generic function to retrieve a DVC variable and convert it to a ResolutionDetails.
     * @param flagKey
     * @param defaultValue
     * @param context
     * @private
     */
    private async getDVCVariable<I extends VariableValue, O>(
        flagKey: string,
        defaultValue: I,
        context: EvaluationContext,
    ): Promise<ResolutionDetails<O>> {
        const dvcVariable = this.devcycleClient.variable(
            this.devcycleUserFromContext(context),
            flagKey,
            defaultValue,
        )
        return this.resultFromDVCVariable<O>(
            dvcVariable instanceof Promise ? await dvcVariable : dvcVariable,
        )
    }

    /**
     * Resolve a boolean OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    async resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext,
    ): Promise<ResolutionDetails<boolean>> {
        return this.getDVCVariable(flagKey, defaultValue, context)
    }

    /**
     * Resolve a string OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    async resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
        context: EvaluationContext,
    ): Promise<ResolutionDetails<string>> {
        return this.getDVCVariable(flagKey, defaultValue, context)
    }

    /**
     * Resolve a number OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    async resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
        context: EvaluationContext,
    ): Promise<ResolutionDetails<number>> {
        return this.getDVCVariable(flagKey, defaultValue, context)
    }

    /**
     * Resolve a object OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    async resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
        context: EvaluationContext,
    ): Promise<ResolutionDetails<T>> {
        return this.getDVCVariable(
            flagKey,
            this.defaultValueFromJsonValue(defaultValue),
            context,
        )
    }

    /**
     * Convert a OpenFeature JsonValue default value into DVCJSON default value for evaluation.
     * @param jsonValue
     * @private
     */
    private defaultValueFromJsonValue(jsonValue: JsonValue): DVCJSON {
        if (typeof jsonValue !== 'object' || Array.isArray(jsonValue)) {
            throw new ParseError(
                'DevCycle only supports object values for JSON flags',
            )
        }
        if (!jsonValue) {
            throw new ParseError(
                'DevCycle does not support null default values for JSON flags',
            )
        }

        // Hard casting here because our DVCJSON typing enforces a flat object when we actually support
        // a JSON Object of any depth. Will be fixed soon.
        return jsonValue
    }

    /**
     * Convert a DVCVariable result into a OpenFeature ResolutionDetails.
     * TODO: add support for variant / reason / and more error codes from DVC.
     * @param variable
     * @private
     */
    private resultFromDVCVariable<T>(
        variable: DVCVariableInterface,
    ): ResolutionDetails<T> {
        return {
            value: variable.value as T,
            reason: variable.isDefaulted
                ? StandardResolutionReasons.DEFAULT
                : StandardResolutionReasons.TARGETING_MATCH,
        }
    }

    /**
     * Convert an OpenFeature EvaluationContext into a DevCycleUser.
     * @param context
     * @private
     */
    private devcycleUserFromContext(context: EvaluationContext): DevCycleUser {
        const user_id = context.targetingKey ?? context.user_id
        if (!user_id) {
            throw new TargetingKeyMissingError(
                'Missing targetingKey or user_id in context',
            )
        }
        if (typeof user_id !== 'string') {
            throw new InvalidContextError(
                'targetingKey or user_id must be a string',
            )
        }

        const dvcUserData: Record<string, string | number | DVCCustomDataJSON> =
            {}
        let customData: DVCCustomDataJSON = {}
        let privateCustomData: DVCCustomDataJSON = {}

        for (const [key, value] of Object.entries(context)) {
            if (key === 'targetingKey' || key === 'user_id') continue

            const knownValueType = DVCKnownPropertyKeyTypes[key]
            if (knownValueType) {
                if (typeof value !== knownValueType) {
                    this.logger.warn(
                        `Expected DevCycleUser property "${key}" to be "${knownValueType}" ` +
                            `but got "${typeof value}" in EvaluationContext. Ignoring value.`,
                    )
                    continue
                }

                switch (knownValueType) {
                    case 'string':
                        dvcUserData[key] = value as string
                        break
                    case 'number':
                        dvcUserData[key] = value as number
                        break
                    case 'object':
                        if (key === 'privateCustomData') {
                            privateCustomData = this.convertToDVCCustomDataJSON(
                                value as EvaluationContextObject,
                            )
                        } else if (key === 'customData') {
                            customData = {
                                ...customData,
                                ...this.convertToDVCCustomDataJSON(
                                    value as EvaluationContextObject,
                                ),
                            }
                        }
                        break
                    default:
                        break
                }
            } else {
                switch (typeof value) {
                    case 'string':
                        customData[key] = value
                        break
                    case 'number':
                        customData[key] = value
                        break
                    case 'boolean':
                        customData[key] = value
                        break
                    case 'object':
                        if (value === null) {
                            customData[key] = null
                            break
                        }
                        this.logger.warn(
                            `EvaluationContext property "${key}" is an ${
                                Array.isArray(value) ? 'Array' : 'Object'
                            }. ` +
                                'DevCycleUser only supports flat customData properties of type ' +
                                'string / number / boolean / null',
                        )
                        break
                    default:
                        this.logger.warn(
                            `Unknown EvaluationContext property "${key}" type. ` +
                                'DevCycleUser only supports flat customData properties of type ' +
                                'string / number / boolean / null',
                        )
                        break
                }
            }
        }
        return new DevCycleUser({
            user_id,
            customData: Object.keys(customData).length ? customData : undefined,
            privateCustomData: Object.keys(privateCustomData).length
                ? privateCustomData
                : undefined,
            ...dvcUserData,
        })
    }

    /**
     * Convert customData from an OpenFeature EvaluationContextObject into a DevCycleUser customData.
     * @param evaluationData
     * @private
     */
    private convertToDVCCustomDataJSON(
        evaluationData: EvaluationContextObject,
    ): DVCCustomDataJSON {
        const customData: DVCCustomDataJSON = {}
        for (const [key, value] of Object.entries(evaluationData)) {
            switch (typeof value) {
                case 'string':
                    customData[key] = value
                    break
                case 'number':
                    customData[key] = value
                    break
                case 'boolean':
                    customData[key] = value
                    break
                case 'undefined':
                    customData[key] = null
                    break
                default:
                    this.logger.warn(
                        `EvaluationContext property "customData" contains "${key}" property of type ${typeof value}. ` +
                            'DevCycleUser only supports flat customData properties of type ' +
                            'string / number / boolean / null',
                    )
                    break
            }
        }
        return customData
    }
}
