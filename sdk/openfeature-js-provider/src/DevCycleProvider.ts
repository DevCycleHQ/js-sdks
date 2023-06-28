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
    Logger,
} from '@openfeature/web-sdk'
import {
    DVCClient,
    DVCOptions,
    DVCVariable,
    DVCUser,
    DVCJSON,
    DVCCustomDataJSON,
    dvcDefaultLogger,
} from '@devcycle/devcycle-js-sdk'
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

export default class DevCycleProvider implements Provider {
    readonly metadata: ProviderMetadata = {
        name: 'devcycle-nodejs-provider',
    } as const

    private readonly logger: DVCLogger

    constructor(
        private readonly dvcClient: DVCClient,
        options: DVCOptions = {},
    ) {
        this.logger =
            options.logger ?? dvcDefaultLogger({ level: options.logLevel })
    }

    async initialize(context?: EvaluationContext): Promise<void> {
        await this.dvcClient.onClientInitialized()
    }

    async onClose(): Promise<void> {
        await this.dvcClient.close()
    }

    async onContextChange(
        oldContext: EvaluationContext,
        newContext: EvaluationContext,
    ): Promise<void> {
        await this.dvcClient.identifyUser(this.dvcUserFromContext(newContext))
    }

    /**
     * Generic function to retrieve a DVC variable and convert it to a ResolutionDetails.
     * @param flagKey
     * @param defaultValue
     * @private
     */
    private getDVCVariable<I extends VariableValue, O>(
        flagKey: string,
        defaultValue: I,
    ): ResolutionDetails<O> {
        const dvcVariable = this.dvcClient.variable(flagKey, defaultValue)
        return this.resultFromDVCVariable<O, I>(dvcVariable)
    }

    /**
     * Resolve a boolean OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext,
        logger: Logger,
    ): ResolutionDetails<boolean> {
        // TODO: What is the logger for?
        // TODO: Is the context here different then onContextChange?
        return this.getDVCVariable(flagKey, defaultValue)
    }

    /**
     * Resolve a string OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
        context: EvaluationContext,
        logger: Logger,
    ): ResolutionDetails<string> {
        return this.getDVCVariable(flagKey, defaultValue)
    }

    /**
     * Resolve a number OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
        context: EvaluationContext,
        logger: Logger,
    ): ResolutionDetails<number> {
        return this.getDVCVariable(flagKey, defaultValue)
    }

    /**
     * Resolve a object OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     * @param context
     */
    resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
        context: EvaluationContext,
        logger: Logger,
    ): ResolutionDetails<T> {
        return this.getDVCVariable(
            flagKey,
            this.defaultValueFromJsonValue(defaultValue),
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
    private resultFromDVCVariable<T, I extends VariableValue>(
        variable: DVCVariable<I>,
    ): ResolutionDetails<T> {
        return {
            value: variable.value as T,
            reason: variable.isDefaulted
                ? StandardResolutionReasons.DEFAULT
                : StandardResolutionReasons.TARGETING_MATCH,
        }
    }

    /**
     * Convert an OpenFeature EvaluationContext into a DVCUser.
     * @param context
     * @private
     */
    private dvcUserFromContext(context: EvaluationContext): DVCUser {
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
                        `Expected DVCUser property "${key}" to be "${knownValueType}" but got "${typeof value}" in ` +
                            'EvaluationContext. Ignoring value.',
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
                                'DVCUser only supports flat customData properties of type ' +
                                'string / number / boolean / null',
                        )
                        break
                    default:
                        this.logger.warn(
                            `Unknown EvaluationContext property "${key}" type. ` +
                                'DVCUser only supports flat customData properties of type ' +
                                'string / number / boolean / null',
                        )
                        break
                }
            }
        }
        return {
            user_id,
            customData: Object.keys(customData).length ? customData : undefined,
            privateCustomData: Object.keys(privateCustomData).length
                ? privateCustomData
                : undefined,
            ...dvcUserData,
        }
    }

    /**
     * Convert customData from an OpenFeature EvaluationContextObject into a DVCUser customData.
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
                        `EvaluationContext property "customData" contains "${key}" property of type ${typeof value}.` +
                            'DVCUser only supports flat customData properties of type string / number / boolean / null',
                    )
                    break
            }
        }
        return customData
    }
}
