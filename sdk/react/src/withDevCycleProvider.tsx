import { ProviderConfig } from './types'
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { DevCycleProvider } from './DevCycleProvider'

export function withDevCycleProvider(
    config: ProviderConfig,
): (WrappedComponent: React.ComponentType) => React.ComponentType {
    return function withDVCProviderHOC(WrappedComponent) {
        class HoistedComponent extends React.Component {
            override render() {
                return (
                    <DevCycleProvider config={config}>
                        <WrappedComponent {...this.props} />
                    </DevCycleProvider>
                )
            }
        }

        hoistNonReactStatics(HoistedComponent, WrappedComponent)

        return HoistedComponent
    }
}

/**
 * @deprecated Use withDevCycleProvider instead
 */
export const withDVCProvider = withDevCycleProvider
