import { VariableMetadata } from '@devcycle/js-cloud-server-sdk'
import { DVCVariable, DVCVariableValue } from '../../src/'
import { HookContext } from './HookContext'

export class EvalHook {
    constructor(
        readonly before: <T extends DVCVariableValue>(
            context: HookContext<T>,
        ) => HookContext<T> | void,
        readonly after: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: DVCVariable<T>,
            variableMetadata: VariableMetadata,
        ) => void,
        readonly onFinally: <T extends DVCVariableValue>(
            context: HookContext<T>,
            variableDetails: DVCVariable<T> | undefined,
            variableMetadata: VariableMetadata | undefined,
        ) => void,
        readonly error: <T extends DVCVariableValue>(
            context: HookContext<T>,
            error: Error,
        ) => void,
    ) {}
}
