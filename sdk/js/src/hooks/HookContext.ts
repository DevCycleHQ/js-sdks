import { DevCycleUser, DVCVariable, DVCVariableValue } from '../types'

export class HookContext<T extends DVCVariableValue> {
    constructor(
        public readonly user: DevCycleUser,
        public readonly variableKey: string,
        public readonly defaultValue: T,
        public readonly metadata: { [key: string]: string },
        public evaluationContext?: Pick<
            DVCVariable<T>,
            'key' | 'value' | 'isDefaulted' | 'eval'
        >,
    ) {}
}
