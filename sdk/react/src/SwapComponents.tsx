import { ComponentProps, ComponentType } from 'react'
import type { VariableKey } from '@devcycle/js-client-sdk'
import useVariableValue from './useVariableValue'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const SwapComponents = <T extends ComponentType<any>>(
    OldComponent: T,
    NewComponent: T,
    variableKey: VariableKey,
) => {
    const DevCycleConditionalComponent = (
        props: ComponentProps<T>,
    ): React.ReactElement => {
        const variableValue = useVariableValue(variableKey, false)
        if (variableValue) {
            return <NewComponent {...props} />
        } else {
            return <OldComponent {...props} />
        }
    }

    return DevCycleConditionalComponent
}
