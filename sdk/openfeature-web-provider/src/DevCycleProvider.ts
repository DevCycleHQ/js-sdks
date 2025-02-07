import {
    EvaluationContext,
    EvaluationContextValue,
    InvalidContextError,
    JsonValue,
    OpenFeatureEventEmitter,
    ParseError,
    Provider,
    ProviderEvents,
    ProviderMetadata,
    ProviderStatus,
    ResolutionDetails,
    StandardResolutionReasons,
    TargetingKeyMissingError,
    TrackingEventDetails,
} from '@openfeature/web-sdk'
// Need to disable this to keep the working jest mock
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
    DevCycleClient,
    DevCycleOptions,
    DevCycleUser,
    DVCCustomDataJSON,
    DVCJSON,
    DVCVariable,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { VariableValue } from '@devcycle/types'

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
        name: 'devcycle-web-provider',
    } as const

    readonly runsOn = 'client'

    private readonly options: DevCycleOptions
    private readonly sdkKey: string

    events = new OpenFeatureEventEmitter()

    private _devcycleClient: DevCycleClient | null = null
    get devcycleClient(): DevCycleClient | null {
        return this._devcycleClient
    }

    constructor(sdkKey: string, options: DevCycleOptions = {}) {
        this.sdkKey = sdkKey
        if (!options.sdkPlatform) {
            options.sdkPlatform = 'js-of'
        } else if (!options.sdkPlatform.toLowerCase().endsWith('-of')) {
            options.sdkPlatform = `${options.sdkPlatform}-of`
        }
        this.options = options
    }

    async initialize(context?: EvaluationContext): Promise<void> {
        this._devcycleClient = await initializeDevCycle(
            this.sdkKey,
            context ? this.dvcUserFromContext(context) : {},
            this.options,
        ).onClientInitialized()

        this._devcycleClient.eventEmitter.subscribe(
            'configUpdated',
            (allVariables) => {
                this.events.emit(
                    ProviderEvents.ConfigurationChanged,
                    allVariables,
                )
            },
        )

        this._devcycleClient.eventEmitter.subscribe('error', (error) => {
            this.events.emit(ProviderEvents.Error, error)
        })

        if (!context) {
            this._devcycleClient.logger.warn(
                'DevCycle initialized without context being set. ' +
                    'It is highly recommended to set a context `OpenFeature.setContext()` ' +
                    'before setting an OpenFeature Provider `OpenFeature.setProvider()` ' +
                    'to avoid multiple API fetch calls.',
            )
        }
    }

    get status(): ProviderStatus {
        return this._devcycleClient?.isInitialized
            ? ProviderStatus.READY
            : ProviderStatus.NOT_READY
    }

    async onClose(): Promise<void> {
        await this._devcycleClient?.close()
    }

    async onContextChange(
        oldContext: EvaluationContext,
        newContext: EvaluationContext,
    ): Promise<void> {
        await this._devcycleClient?.identifyUser(
            this.dvcUserFromContext(newContext),
        )
    }

    track(
        trackingEventName: string,
        context?: EvaluationContext,
        trackingEventDetails?: TrackingEventDetails,
    ): void {
        this._devcycleClient?.track({
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
     * @param dvcDefaultValue
     * @param ofDefaultValue
     * @private
     */
    private getDVCVariable<I extends VariableValue, O>(
        flagKey: string,
        dvcDefaultValue: I,
        ofDefaultValue: O,
    ): ResolutionDetails<O> {
        const dvcVariable = this._devcycleClient?.variable(
            flagKey,
            dvcDefaultValue,
        )
        return this.resultFromDVCVariable<O, I>(dvcVariable, ofDefaultValue)
    }

    /**
     * Resolve a boolean OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     */
    resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
    ): ResolutionDetails<boolean> {
        return this.getDVCVariable(flagKey, defaultValue, defaultValue)
    }

    /**
     * Resolve a string OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     */
    resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
    ): ResolutionDetails<string> {
        return this.getDVCVariable(flagKey, defaultValue, defaultValue)
    }

    /**
     * Resolve a number OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     */
    resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
    ): ResolutionDetails<number> {
        return this.getDVCVariable(flagKey, defaultValue, defaultValue)
    }

    /**
     * Resolve an object OpenFeature flag and its evaluation details.
     * @param flagKey
     * @param defaultValue
     */
    resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
    ): ResolutionDetails<T> {
        return this.getDVCVariable(
            flagKey,
            this.defaultValueFromJsonValue(defaultValue),
            defaultValue,
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
     * @param ofDefaultValue
     * @private
     */
    private resultFromDVCVariable<T, I extends VariableValue>(
        variable: DVCVariable<I> | undefined,
        ofDefaultValue: T,
    ): ResolutionDetails<T> {
        return variable
            ? {
                  value: variable.value as T,
                  reason: variable.isDefaulted
                      ? StandardResolutionReasons.DEFAULT
                      : StandardResolutionReasons.TARGETING_MATCH,
              }
            : {
                  value: ofDefaultValue,
                  reason: StandardResolutionReasons.DEFAULT,
              }
    }

    /**
     * Convert an OpenFeature EvaluationContext into a DevCycleUser.
     * @param context
     * @private
     */
    private dvcUserFromContext(context: EvaluationContext): DevCycleUser {
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
                    this._devcycleClient?.logger.warn(
                        `Expected DevCycleUser property "${key}" to be "${knownValueType}" but got ` +
                            `"${typeof value}" in EvaluationContext. Ignoring value.`,
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
                        this._devcycleClient?.logger.warn(
                            `EvaluationContext property "${key}" is an ${
                                Array.isArray(value) ? 'Array' : 'Object'
                            }. ` +
                                'DevCycleUser only supports flat customData properties of type ' +
                                'string / number / boolean / null',
                        )
                        break
                    default:
                        this._devcycleClient?.logger.warn(
                            `Unknown EvaluationContext property "${key}" type. ` +
                                'DevCycleUser only supports flat customData properties of type ' +
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
                    this._devcycleClient?.logger.warn(
                        `EvaluationContext property "customData" contains "${key}" property of type ${typeof value}.` +
                            'DevCycleUser only supports flat customData properties of type ' +
                            'string / number / boolean / null',
                    )
                    break
            }
        }
        return customData
    }
}
