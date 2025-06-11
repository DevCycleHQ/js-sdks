import {
    EvaluationContext,
    EvaluationContextValue,
    JsonValue,
    OpenFeatureEventEmitter,
    ParseError,
    Provider,
    ProviderEvents,
    ProviderMetadata,
    ProviderStatus,
    ResolutionDetails,
    StandardResolutionReasons,
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
                      : variable.eval?.reason ??
                        StandardResolutionReasons.TARGETING_MATCH,
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
        // Get first non-empty userId from targetingKey, user_id, or userId
        const userId =
            [context.targetingKey, context.user_id, context.userId]
                .filter(
                    (id): id is string => typeof id === 'string' && id !== '',
                )
                .shift() || null

        const dvcUserData: Partial<DevCycleUser> = {}
        let customData: DVCCustomDataJSON = {}
        let privateCustomData: DVCCustomDataJSON = {}

        // Set userId if available
        if (userId && typeof userId === 'string') {
            dvcUserData.user_id = userId
        }

        for (const [key, value] of Object.entries(context)) {
            // Skip user ID fields as they're handled above
            if (
                key === 'targetingKey' ||
                key === 'user_id' ||
                key === 'userId'
            ) {
                continue
            }

            // Handle known DevCycleUser properties with type checking
            if (
                key === 'email' ||
                key === 'name' ||
                key === 'language' ||
                key === 'country' ||
                key === 'appVersion'
            ) {
                if (typeof value === 'string') {
                    dvcUserData[key] = value
                } else {
                    this._devcycleClient?.logger.warn(
                        `Expected DevCycleUser property "${key}" to be "string" but got ` +
                            `"${typeof value}" in EvaluationContext. Ignoring value.`,
                    )
                }
            } else if (key === 'appBuild') {
                if (typeof value === 'number') {
                    dvcUserData[key] = value
                } else {
                    this._devcycleClient?.logger.warn(
                        `Expected DevCycleUser property "${key}" to be "number" but got ` +
                            `"${typeof value}" in EvaluationContext. Ignoring value.`,
                    )
                }
            } else if (key === 'isAnonymous') {
                if (typeof value === 'boolean') {
                    dvcUserData[key] = value
                } else {
                    this._devcycleClient?.logger.warn(
                        `Expected isAnonymous to be boolean but got "${typeof value}" in ` +
                            `EvaluationContext. Ignoring value.`,
                    )
                }
            } else if (key === 'privateCustomData') {
                if (
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value)
                ) {
                    privateCustomData = this.convertToDVCCustomDataJSON(
                        value as EvaluationContextObject,
                    )
                } else {
                    this._devcycleClient?.logger.warn(
                        `Expected DevCycleUser property "privateCustomData" to be "object" but got ` +
                            `"${typeof value}" in EvaluationContext. Ignoring value.`,
                    )
                }
            } else if (key === 'customData') {
                if (
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value)
                ) {
                    customData = {
                        ...customData,
                        ...this.convertToDVCCustomDataJSON(
                            value as EvaluationContextObject,
                        ),
                    }
                } else {
                    this._devcycleClient?.logger.warn(
                        `Expected DevCycleUser property "customData" to be "object" but got ` +
                            `"${typeof value}" in EvaluationContext. Ignoring value.`,
                    )
                }
            } else {
                // Add to customData if it's a flat JSON value
                if (this.isFlatJsonValue(value)) {
                    customData[key] = value
                } else {
                    this._devcycleClient?.logger.warn(
                        `Unknown EvaluationContext property "${key}" type. ` +
                            'DevCycleUser only supports flat customData properties of type ' +
                            'string / number / boolean / null',
                    )
                }
            }
        }

        // If no userId was set and isAnonymous wasn't explicitly set, default to anonymous
        if (!userId && typeof context.isAnonymous !== 'boolean') {
            dvcUserData.isAnonymous = true
        }

        return {
            ...dvcUserData,
            customData: Object.keys(customData).length ? customData : undefined,
            privateCustomData: Object.keys(privateCustomData).length
                ? privateCustomData
                : undefined,
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

    /**
     * Check if a value is a flat JSON value supported by DevCycle.
     * @param value
     * @private
     */
    private isFlatJsonValue(
        value: EvaluationContextValue,
    ): value is string | number | boolean | null {
        return (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
        )
    }
}
