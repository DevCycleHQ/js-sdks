import type { AppProps as NextJsAppProps } from 'next/app'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { SSRProps } from './types'
import { DevCycleProvider, useDevCycleClient } from '@devcycle/react-client-sdk'
import React from 'react'
import { DevCycleOptions } from '@devcycle/js-client-sdk'

/**
 * Component which runs a one-time sync of the server's boostrap data to the client's DevCycleClient
 * @param devcycleSSR
 * @param children
 * @constructor
 */
const BootstrapSync = ({
    devcycleSSR,
    children,
}: {
    devcycleSSR: SSRProps['_devcycleSSR']
    children: React.ReactNode
}) => {
    const client = useDevCycleClient()
    const [isInitialized, setIsInitialized] = React.useState(false)
    if (!isInitialized) {
        client.synchronizeBootstrapData(
            devcycleSSR.bucketedConfig,
            devcycleSSR.user,
            devcycleSSR.userAgent ?? undefined,
        )
        setIsInitialized(true)
    }
    return children
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const appWithDevCycle = <Props extends NextJsAppProps>(
    WrappedComponent: React.ComponentType<Props>,
    additionalOptions: DevCycleOptions = {},
) => {
    const AppWithDevCycle = (
        props: Props & { pageProps: Props['pageProps'] & SSRProps },
    ) => {
        const devcycleSSR = props.pageProps
            ._devcycleSSR as SSRProps['_devcycleSSR']

        const onServerside = typeof window === 'undefined'

        if (!devcycleSSR) {
            return <WrappedComponent {...props} />
        }

        return (
            <DevCycleProvider
                config={{
                    sdkKey: devcycleSSR.sdkKey,
                    options: {
                        ...additionalOptions,
                        deferInitialization: true,
                        disableAutomaticEventLogging: onServerside,
                        disableCustomEventLogging: onServerside,
                        disableRealtimeUpdates: onServerside,
                        disableConfigCache: true,
                        next: {},
                    },
                }}
            >
                <BootstrapSync devcycleSSR={devcycleSSR}>
                    <WrappedComponent {...props} />
                </BootstrapSync>
            </DevCycleProvider>
        )
    }

    return hoistNonReactStatics(AppWithDevCycle, WrappedComponent)
}
