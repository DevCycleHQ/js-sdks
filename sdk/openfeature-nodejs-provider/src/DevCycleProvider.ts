import {
    Provider,
    ResolutionDetails,
    EvaluationContext,
    JsonValue,
    EvaluationContextValue,
    ProviderMetadata,
    StandardResolutionReasons
} from '@openfeature/js-sdk'
import {
    DVCClient,
    DVCOptions,
    DVCVariable,
    DVCUser,
    DVCJSON,
    DVCCustomDataJSON,
    dvcDefaultLogger
} from '@devcycle/nodejs-server-sdk'
import { DVCLogger } from '@devcycle/types'

const DVCKnownPropertyKeyTypes: Record<string, string> = {
    email: 'string',
    name: 'string',
    language: 'string',
    country: 'string',
    appVersion: 'string',
    appBuild: 'number',
    customData: 'object',
    privateCustomData: 'object'
}

type EvaluationContextObject = {
    [key: string]: EvaluationContextValue
}

export class DevCycleProvider implements Provider {
    readonly metadata: ProviderMetadata = {
        name: 'devcycle-nodejs-provider',
    } as const

    private readonly logger: DVCLogger

    constructor(private readonly dvcClient: DVCClient, options: DVCOptions = {}) {
        this.logger = options.logger ?? dvcDefaultLogger({ level: options.logLevel })
    }

    async resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext
    ): Promise<ResolutionDetails<boolean>> {
        const dvcVariable = this.dvcClient.variable<boolean>(
            this.dvcUserFromContext(context),
            flagKey,
            defaultValue
        )
        return this.resultFromDVCVariable<boolean>(dvcVariable)
    }

    /**
     * Resolve a string flag and its evaluation details.
     */
    async resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
        context: EvaluationContext
    ): Promise<ResolutionDetails<string>> {
        const dvcVariable = this.dvcClient.variable<string>(
            this.dvcUserFromContext(context),
            flagKey,
            defaultValue
        )
        return this.resultFromDVCVariable<string>(dvcVariable)
    }

    /**
     * Resolve a numeric flag and its evaluation details.
     */
    async resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
        context: EvaluationContext
    ): Promise<ResolutionDetails<number>> {
        const dvcVariable = this.dvcClient.variable<number>(
            this.dvcUserFromContext(context),
            flagKey,
            defaultValue
        )
        return this.resultFromDVCVariable<number>(dvcVariable)
    }

    /**
     * Resolve and parse an object flag and its evaluation details.
     */
    async resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
        context: EvaluationContext
    ): Promise<ResolutionDetails<T>> {
        const dvcVariable = this.dvcClient.variable<DVCJSON>(
            this.dvcUserFromContext(context),
            flagKey,
            this.defaultValueFromJsonValue(defaultValue)
        )
        return this.resultFromDVCVariable<T>(dvcVariable)
    }

    private defaultValueFromJsonValue(jsonValue: JsonValue): DVCJSON {
        if (typeof jsonValue !== 'object') {
            throw new Error('DevCycle only supports object values for JSON flags')
        }
        if (!jsonValue) {
            throw new Error('DevCycle does not support null default values for JSON flags')
        }

        // Hard casting here because our DVCJSON typing enforces a flat object when we actually support
        // a JSON Object of any depth. Will be fixed soon.
        return jsonValue as DVCJSON
    }

    private resultFromDVCVariable<T>(variable: DVCVariable): ResolutionDetails<T> {
        return {
            value: variable.value as T,
            reason: variable.isDefaulted
                ? StandardResolutionReasons.DEFAULT
                : StandardResolutionReasons.TARGETING_MATCH,
        }
    }

    private dvcUserFromContext(context: EvaluationContext): DVCUser {
        const user_id = context.targetingKey ?? context.user_id
        if (!user_id) throw new Error('Missing targetingKey or user_id in context')
        if (typeof user_id !== 'string') throw new Error('targetingKey or user_id must be a string')

        const dvcUserData: Record<string, string | number | DVCCustomDataJSON> = {}
        let customData: DVCCustomDataJSON = {}
        let privateCustomData: DVCCustomDataJSON = {}

        for (const [key, value] of Object.entries(context)) {
            if (key === 'targetingKey' || key === 'user_id') continue

            const knownValueType = DVCKnownPropertyKeyTypes[key]
            if (knownValueType) {
                if (typeof value !== knownValueType) {
                    this.logger.warn(
                        `Expected DVCUser property "${key}" to be ${knownValueType} but got ${typeof value} in ` +
                        'EvaluationContext. Ignoring value.'
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
                        if (key === 'privateCustomData')  {
                            privateCustomData = this.convertToDVCCustomDataJSON(value as EvaluationContextObject)
                        } else if (key === 'customData') {
                            customData = {
                                ...customData,
                                ...this.convertToDVCCustomDataJSON(value as EvaluationContextObject)
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
                    case 'undefined':
                        customData[key] = null
                        break
                    case 'object':
                        this.logger.warn(
                            `EvaluationContext property "${key}" is an object. ` +
                            'DVCUser only supports flat customData properties of type string / number / boolean / null'
                        )
                        break
                    default:
                        this.logger.warn(
                            `Unknown EvaluationContext property "${key}" type. ` +
                            'DVCUser only supports flat customData properties of type string / number / boolean / null'
                        )
                        break
                }
            }
        }
        return new DVCUser({ user_id, customData, privateCustomData, ...dvcUserData })
    }

    private convertToDVCCustomDataJSON(evaluationData: EvaluationContextObject): DVCCustomDataJSON {
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
                        'DVCUser only supports flat customData properties of type string / number / boolean / null'
                    )
                    break
            }
        }
        return customData
    }
}
