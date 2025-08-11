import { Span, SpanKind, Tracer } from '@opentelemetry/api'
import { HookContext } from './HookContext'
import { EvalHook } from './EvalHook'
import { DVCVariable, DVCVariableValue } from '..'
import { VariableMetadata } from '@devcycle/js-cloud-server-sdk'
import { ProjectMetadata, EnvironmentMetadata } from '@devcycle/types'

/**
 * This hook can be used to connect to a Dynatrace instance, logging feature flag evaluations
 * to a span using OpenTelemetry spans.
 */
class DynatraceOtelSpanHook implements EvalHook {
    private name: string
    private tracer: Tracer
    private spans: WeakMap<HookContext<DVCVariableValue>, Span> = new WeakMap()

    constructor(tracer: Tracer) {
        this.name = 'DynatraceOtelLogHook'
        this.tracer = tracer
    }

    before<T extends DVCVariableValue>(hookContext: HookContext<T>) {
        const span = this.tracer.startSpan(
            `feature_flag_evaluation.${hookContext.variableKey}`,
            {
                kind: SpanKind.SERVER,
            },
        )
        if (span) {
            const projectKey = (
                hookContext.metadata?.project as ProjectMetadata
            )?.key
            const environmentKey = (
                hookContext.metadata?.environment as EnvironmentMetadata
            )?.key
            span.setAttributes({
                'feature_flag.key': hookContext.variableKey,
                'feature_flag.value_type': typeof hookContext.defaultValue,
                'feature_flag.flagset': hookContext.variableKey,
                'feature_flag.project': projectKey,
                'feature_flag.environment': environmentKey,
            })
        }
        this.spans.set(hookContext, span)
    }

    after<T extends DVCVariableValue>(
        hookContext: HookContext<T>,
        variableDetails: DVCVariable<T>,
        variableMetadata: VariableMetadata,
    ) {}

    error(hookContext: HookContext<DVCVariableValue>, error: Error) {
        const span = this.spans.get(hookContext)
        const { message } = error
        if (span && message) {
            span.setAttributes({
                'feature_flag.error_message': message,
            })
        }
    }

    onFinally<T extends DVCVariableValue>(
        hookContext: HookContext<T>,
        variableDetails: DVCVariable<T> | undefined,
        variableMetadata: VariableMetadata | undefined,
    ): void {
        const span = this.spans.get(hookContext)

        if (variableDetails && span) {
            const { value, eval: evalReason } = variableDetails
            span.setAttributes({
                'feature_flag.value': String(value),
                ...(evalReason && {
                    'feature_flag.reason': evalReason.reason,
                }),
            })
            span.end()
        }
    }
}

export { DynatraceOtelSpanHook }
