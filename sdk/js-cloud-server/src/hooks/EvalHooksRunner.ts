import { DevCycleUser, DVCVariable } from '../../src/'
import { EvalHook } from './EvalHook'
import { HookContext } from './HookContext'
import { DVCLogger } from '@devcycle/types'
import { VariableValue as DVCVariableValue } from '@devcycle/types'

export class EvalHooksRunner {
    constructor(
        private readonly hooks: EvalHook[] = [],
        private readonly logger?: DVCLogger,
    ) {}

    async runHooksForEvaluation<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
        resolver: (context: HookContext<T>) => Promise<DVCVariable<T>>,
    ): Promise<DVCVariable<T>> {
        const context = new HookContext<T>(user, key, defaultValue, {})
        const savedHooks = [...this.hooks]
        const reversedHooks = [...savedHooks].reverse()

        let beforeContext = context
        let variableDetails: DVCVariable<T>
        try {
            beforeContext = await this.runBefore(savedHooks, context)
            variableDetails = await resolver(beforeContext)
            await this.runAfter(savedHooks, beforeContext, variableDetails)
        } catch (error) {
            await this.runError(reversedHooks, context, error)
            await this.runFinally(reversedHooks, context, undefined)
            if (
                error.name === 'BeforeHookError' ||
                error.name === 'AfterHookError'
            ) {
                // make sure to return with a variable if before or after hook errors
                return await resolver(context)
            }
            throw error
        }
        await this.runFinally(reversedHooks, context, variableDetails)
        return variableDetails
    }

    private async runBefore<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
    ): Promise<HookContext<T>> {
        const contextCopy = { ...context }
        try {
            for (const hook of hooks) {
                const newContext = await hook.before(contextCopy)
                if (newContext) {
                    Object.assign(contextCopy, {
                        ...contextCopy,
                        ...newContext,
                    })
                }
            }
        } catch (error) {
            this.logger?.error('Error running before hooks', error)
            throw new BeforeHookError(error)
        }
        return contextCopy
    }

    private async runAfter<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
        variableDetails: DVCVariable<T>,
    ): Promise<void> {
        try {
            for (const hook of hooks) {
                await hook.after(context, variableDetails)
            }
        } catch (error) {
            this.logger?.error('Error running after hooks', error)
            throw new AfterHookError(error)
        }
    }

    private async runFinally<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
        variableDetails: DVCVariable<T> | undefined,
    ): Promise<void> {
        try {
            for (const hook of hooks) {
                await hook.onFinally(context, variableDetails)
            }
        } catch (error) {
            this.logger?.error('Error running finally hooks', error)
        }
    }

    private async runError<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
        error: Error,
    ): Promise<void> {
        try {
            for (const hook of hooks) {
                await hook.error(context, error)
            }
        } catch (error) {
            this.logger?.error('Error running error hooks', error)
        }
    }

    enqueue(hook: EvalHook): void {
        this.hooks.push(hook)
    }
}

class BeforeHookError extends Error {
    constructor(error: Error) {
        super(error.message)
        this.name = 'BeforeHookError'
        this.stack = error.stack
    }
}

class AfterHookError extends Error {
    constructor(error: Error) {
        super(error.message)
        this.name = 'AfterHookError'
        this.stack = error.stack
    }
}
