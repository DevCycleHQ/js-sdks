import type { DVCVariable, DVCVariableValue } from '@devcycle/js-client-sdk'
import { DevCycleClient } from '@devcycle/js-client-sdk'

export const useVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    // const [_, forceRerender] = useState({})
    // const forceRerenderCallback = useCallback(() => forceRerender({}), [])
    const client = (globalThis as any).devcycleClient

    return client ? client.variable(key, defaultValue) : defaultValue
}

export default useVariable
