import { HookContext } from './HookContext'
import { DVCVariableValue } from '../types'
export class EvalHook<T extends DVCVariableValue> {
    constructor(
        readonly before: (context: HookContext<T>) => Promise<void>,
        readonly after: (context: HookContext<T>) => Promise<void>,
        readonly onFinally: (context: HookContext<T>) => Promise<void>,
        readonly error: (
            context: HookContext<T>,
            error: Error,
        ) => Promise<void>,
    ) {}
}
