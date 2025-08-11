import {
    VariableMetadata,
    VariableAndMetadata,
} from '@devcycle/js-cloud-server-sdk'
import { DevCycleUser, DVCVariable } from '../../src/'
import { EvalHook } from './EvalHook'
import { HookContext, HookMetadata } from './HookContext'
import { DVCLogger } from '@devcycle/types'
import { VariableValue as DVCVariableValue } from '@devcycle/types'

export class EvalHooksRunner {
    constructor(
        private readonly hooks: EvalHook[] = [],
        private readonly logger?: DVCLogger,
    ) {}

    runHooksForEvaluation<T extends DVCVariableValue>(
        user: DevCycleUser,
        key: string,
        defaultValue: T,
        metadata: HookMetadata,
        resolver: (context: HookContext<T>) => VariableAndMetadata<T>,
    ): DVCVariable<T> {
        const context = new HookContext<T>(user, key, defaultValue, metadata)
        const savedHooks = [...this.hooks]
        const reversedHooks = [...savedHooks].reverse()

        let beforeContext = context
        let variableDetails: DVCVariable<T> | undefined
        let variableMetadata: VariableMetadata | undefined
        try {
            beforeContext = this.runBefore(savedHooks, context)
            const { variable, metadata }: VariableAndMetadata<T> =
                resolver.call(beforeContext)
            variableDetails = variable
            variableMetadata = metadata
            this.runAfter(
                savedHooks,
                beforeContext,
                variableDetails,
                variableMetadata,
            )
        } catch (error) {
            this.runError(reversedHooks, context, error)
            this.runFinally(
                reversedHooks,
                context,
                variableDetails,
                variableMetadata,
            )
            if (
                error.name === 'BeforeHookError' ||
                error.name === 'AfterHookError'
            ) {
                // make sure to return with a variable if before or after hook errors
                const { variable } = resolver.call(context)
                return variable
            }
            throw error
        }
        this.runFinally(
            reversedHooks,
            context,
            variableDetails,
            variableMetadata,
        )
        return variableDetails
    }

    private runBefore<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
    ) {
        const contextCopy = { ...context }
        try {
            for (const hook of hooks) {
                const newContext = hook.before(contextCopy)
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

    private runAfter<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
        variableDetails: DVCVariable<T>,
        variableMetadata: VariableMetadata,
    ) {
        try {
            for (const hook of hooks) {
                hook.after(context, variableDetails, variableMetadata)
            }
        } catch (error) {
            this.logger?.error('Error running after hooks', error)
            throw new AfterHookError(error)
        }
    }

    private runFinally<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
        variableDetails: DVCVariable<T> | undefined,
        variableMetadata: VariableMetadata | undefined,
    ) {
        try {
            for (const hook of hooks) {
                hook.onFinally(context, variableDetails, variableMetadata)
            }
        } catch (error) {
            this.logger?.error('Error running finally hooks', error)
        }
    }

    private runError<T extends DVCVariableValue>(
        hooks: EvalHook[],
        context: HookContext<T>,
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

    enqueue(hook: EvalHook): void {
        this.hooks.push(hook)
    }
}

class HooksRunnerError extends Error {
    constructor(error: Error) {
        super(error.message)
        this.name = 'HooksRunnerError'
        this.stack = error.stack
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
