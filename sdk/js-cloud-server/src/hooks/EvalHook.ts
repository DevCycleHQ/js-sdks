import { DVCVariable, DVCVariableValue } from '../../src/'
import { HookContext } from './HookContext'

export class EvalHook {
    constructor(
        readonly before: <T extends DVCVariableValue>(
            context: HookContext<T>,
        ) => Promise<HookContext<T> | void>,
        readonly after: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: DVCVariable<T>,
        ) => Promise<void>,
        readonly onFinally: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: DVCVariable<T> | undefined,
        ) => Promise<void>,
        readonly error: <T extends DVCVariableValue>(
            context: HookContext<T>,
            error: Error,
        ) => Promise<void>,
    ) {}
}
