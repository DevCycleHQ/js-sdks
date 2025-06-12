import { HookContext } from './HookContext'
import { DVCVariableValue } from '../types'
export class EvalHook<T extends DVCVariableValue> {
    constructor(
        readonly before: (context: HookContext<T>) => void,
        readonly after: (context: HookContext<T>) => void,
        readonly onFinally: (context: HookContext<T>) => void,
        readonly error: (context: HookContext<T>, error: Error) => void,
    ) {}
}
