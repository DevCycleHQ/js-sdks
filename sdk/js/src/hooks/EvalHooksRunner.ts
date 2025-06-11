import { DevCycleUser, DVCVariable, DVCVariableValue } from '../types'
import { EvalHook } from './EvalHook'
import { HookContext } from './HookContext'

export class EvaluationHooksRunner<T extends DVCVariableValue> {
    constructor(private readonly hooks: EvalHook<T>[] = []) {}

    async runHooksForEvaluation(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
        resolver: () => any,
    ): Promise<DVCVariable<T>> {
        const context = new HookContext<T>(user, key, defaultValue, {})
        const savedHooks = [...this.hooks]
        const reversedHooks = [...savedHooks].reverse()

        let variable: DVCVariable<T>
        try {
            await this.runBefore(savedHooks, context)
            variable = await resolver.call(context)

            const evaluationContext = {
                key,
                value: variable.value,
                isDefaulted: variable.isDefaulted,
                eval: variable.eval,
            }

            context.evaluationContext = evaluationContext

            await this.runAfter(reversedHooks, context)
        } catch (error) {
            await this.runError(reversedHooks, context, error as Error)
            await this.runFinally(reversedHooks, context)
            throw error
        }
        await this.runFinally(reversedHooks, context)
        return variable
    }

    private async runBefore(hooks: EvalHook<T>[], context: HookContext<T>) {
        for (const hook of hooks) {
            await hook.before(context)
        }
    }

    private async runAfter(hooks: EvalHook<T>[], context: HookContext<T>) {
        for (const hook of hooks) {
            await hook.after(context)
        }
    }

    private async runFinally(hooks: EvalHook<T>[], context: HookContext<T>) {
        try {
            for (const hook of hooks) {
                await hook.onFinally(context)
            }
        } catch (error) {
            // log using the logger
        }
    }

    private async runError(
        hooks: EvalHook<T>[],
        context: HookContext<T>,
        error: Error,
    ) {
        try {
            for (const hook of hooks) {
                await hook.error(context, error)
            }
        } catch (error) {
            // log using the logger
        }
    }

    enqueue(hook: EvalHook<T>): void {
        this.hooks.push(hook)
    }
}
