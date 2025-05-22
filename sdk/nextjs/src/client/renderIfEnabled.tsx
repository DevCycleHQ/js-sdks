import { ComponentProps, ComponentType } from 'react'
import dynamic from 'next/dynamic'
import useVariableValue from './useVariableValue'

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const renderIfEnabled = <T extends { default: ComponentType<any> }>(
    key: string,
    importFunc: () => Promise<T>,
) => {
    const Component = dynamic(() => importFunc())
    return function (props: ComponentProps<T['default']>) {
        const isEnabled = useVariableValue(key, false)
        if (isEnabled) {
            return <Component {...props} />
        }
        return null
    }
}
