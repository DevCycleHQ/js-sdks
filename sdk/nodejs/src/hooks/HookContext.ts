import { DevCycleUser, DVCVariableValue } from '../../src/'
import { ConfigMetadata } from '../models/ConfigMetadata'

export class HookContext<T extends DVCVariableValue> {
    constructor(
        public user: DevCycleUser,
        public readonly variableKey: string,
        public readonly defaultValue: T,
        public readonly metadata: { [key: string]: string },
        public readonly configMetadata: ConfigMetadata | null,
    ) {}

    /**
     * Get the config metadata for this evaluation context
     */
    getConfigMetadata(): ConfigMetadata | null {
        return this.configMetadata
    }
}
