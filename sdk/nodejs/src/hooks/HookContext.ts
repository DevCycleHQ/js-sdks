import { DevCycleUser, DVCVariableValue } from '../../src/'

export class HookContext<T extends DVCVariableValue> {
    constructor(
        public user: DevCycleUser,
        public readonly variableKey: string,
        public readonly defaultValue: T,
        public readonly metadata: { [key: string]: string },
    ) {}
}
