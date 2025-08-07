import { InternalDVCVariable, DVCVariableValue } from '../../src/'
import { HookContext } from './HookContext'

export class EvalHook {
    constructor(
        readonly before: <T extends DVCVariableValue>(
            context: HookContext<T>,
        ) => HookContext<T> | void,
        readonly after: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: InternalDVCVariable<T>,
        ) => void,
        readonly onFinally: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: InternalDVCVariable<T> | undefined,
        ) => void,
        readonly error: <T extends DVCVariableValue>(
            context: HookContext<T>,
            error: Error,
        ) => void,
    ) {}
}
