import type { AppProps as NextJsAppProps } from 'next/app'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { SSRProps } from './types'
import { DevCycleProvider } from '@devcycle/react-client-sdk'
import React from 'react'
import { DevCycleOptions } from '@devcycle/js-client-sdk'

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
                    user: devcycleSSR.user,
                    sdkKey: devcycleSSR.sdkKey,
                    options: {
                        ...additionalOptions,
                        disableAutomaticEventLogging: onServerside,
                        disableCustomEventLogging: onServerside,
                        disableRealtimeUpdates: onServerside,
                        disableConfigCache: true,
                        bootstrapConfig: devcycleSSR.bucketedConfig,
                        next: {},
                    },
                }}
            >
                <WrappedComponent {...props} />
            </DevCycleProvider>
        )
    }

    return hoistNonReactStatics(AppWithDevCycle, WrappedComponent)
}
