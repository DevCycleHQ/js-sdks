import { ProviderConfig } from './types'
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import DVCProvider from './DVCProvider'

export default function withDVCProvider(
    config: ProviderConfig,
): (WrappedComponent: React.ComponentType) => React.ComponentType {
    return function withDVCProviderHOC(WrappedComponent) {
        class HoistedComponent extends React.Component {
            override render() {
                return (
                    <DVCProvider config={config}>
                        <WrappedComponent {...this.props} />
                    </DVCProvider>
                )
            }
        }

        hoistNonReactStatics(HoistedComponent, WrappedComponent)

        return HoistedComponent
    }
}
