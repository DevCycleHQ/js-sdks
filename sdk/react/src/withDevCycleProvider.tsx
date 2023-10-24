import { ProviderConfig } from './types'
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { DevCycleProvider } from './DevCycleProvider'

export function withDevCycleProvider<T extends object>(
    config: ProviderConfig,
): (WrappedComponent: React.ComponentType<T>) => React.ComponentType<T> {
    return (WrappedComponent) => {
        const HoistedComponent = (props: T) => {
            return (
                <DevCycleProvider config={config}>
                    <WrappedComponent {...props} />
                </DevCycleProvider>
            )
        }

        hoistNonReactStatics(HoistedComponent, WrappedComponent)

        return HoistedComponent
    }
}

/**
 * @deprecated Use withDevCycleProvider instead
 */
export const withDVCProvider = withDevCycleProvider
