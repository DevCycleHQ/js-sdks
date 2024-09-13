import { ProviderConfig } from './types'
import React, {
    forwardRef,
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { DevCycleProvider } from './DevCycleProvider'
import { DVCCustomDataJSON } from '@devcycle/js-client-sdk'

export function withDevCycleProvider<CustomData extends DVCCustomDataJSON = DVCCustomDataJSON>(
    config: ProviderConfig<CustomData>,
) {
    return function <T extends object>(
        WrappedComponent: React.ComponentType<T>,
    ): ForwardRefExoticComponent<PropsWithoutRef<T> & RefAttributes<unknown>> {
        const HoistedComponent = forwardRef((props: T, ref) => {
            return (
                <DevCycleProvider config={config}>
                    <WrappedComponent {...props} ref={ref} />
                </DevCycleProvider>
            )
        })

        hoistNonReactStatics(HoistedComponent, WrappedComponent)

        return HoistedComponent
    }
}

/**
 * @deprecated Use withDevCycleProvider instead
 */
export const withDVCProvider = withDevCycleProvider
