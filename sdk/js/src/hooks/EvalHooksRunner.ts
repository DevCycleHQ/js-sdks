import { DVCVariable } from '../Variable'
import { DVCPopulatedUser } from '../User'
import { EvalHook } from './EvalHook'
import { HookContext } from './HookContext'
import { DVCVariableValue } from '../types'
import { DVCLogger } from '@devcycle/types'

export class EvalHooksRunner {
    constructor(
        private hooks: EvalHook<DVCVariableValue>[] = [],
        private readonly logger?: DVCLogger,
    ) {}

    runHooksForEvaluation<T extends DVCVariableValue>(
        user: DVCPopulatedUser | undefined,
        key: string,
        defaultValue: T,
        resolver: () => DVCVariable<T>,
    ): DVCVariable<T> {
        const context = new HookContext<DVCVariableValue>(
            user ?? {},
            key,
            defaultValue,
            {},
        )
        const savedHooks = [...this.hooks]
        const reversedHooks = [...savedHooks].reverse()

        let variable: DVCVariable<T>
        try {
            const frozenContext = Object.freeze({
                ...context,
            })
            this.runBefore(savedHooks, frozenContext)
            variable = resolver.call(frozenContext)

            const evaluationContext = {
                key,
                value: variable.value,
                isDefaulted: variable.isDefaulted,
                eval: variable.eval,
            }

            context.evaluationContext = evaluationContext

            this.runAfter(reversedHooks, context)
        } catch (error) {
            this.runError(reversedHooks, context, error as Error)
            this.runFinally(reversedHooks, context)
            throw error
        }
        this.runFinally(reversedHooks, context)
        return variable
    }

    private runBefore(
        hooks: EvalHook<DVCVariableValue>[],
        context: HookContext<DVCVariableValue>,
    ) {
        for (const hook of hooks) {
            hook.before(context)
        }
    }

    private runAfter(
        hooks: EvalHook<DVCVariableValue>[],
        context: HookContext<DVCVariableValue>,
    ) {
        for (const hook of hooks) {
            hook.after(context)
        }
    }

    private runFinally(
        hooks: EvalHook<DVCVariableValue>[],
        context: HookContext<DVCVariableValue>,
    ) {
        try {
            for (const hook of hooks) {
                hook.onFinally(context)
            }
        } catch (error) {
            this.logger?.error('Error running before hooks', error)
        }
    }

    private runError(
        hooks: EvalHook<DVCVariableValue>[],
        context: HookContext<DVCVariableValue>,
        error: Error,
    ) {
        try {
            for (const hook of hooks) {
                hook.error(context, error)
            }
        } catch (error) {
            this.logger?.error('Error running error hooks', error)
        }
    }

    enqueue(hook: EvalHook<DVCVariableValue>): void {
        this.hooks.push(hook)
    }

    clear(): void {
        this.hooks = []
    }
}
