import type { AppProps as NextJsAppProps } from 'next/app'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { SSRProps } from './types'
import { DevCycleProvider } from '@devcycle/react-client-sdk'
import React from 'react'
import { DevCycleOptions } from '@devcycle/js-client-sdk'
import { ConfigSource } from '@devcycle/types'

type DevCycleNextOptions = Pick<
    DevCycleOptions,
    | 'maxEventQueueSize'
    | 'flushEventQueueSize'
    | 'eventFlushIntervalMS'
    | 'logger'
    | 'logLevel'
    | 'apiProxyURL'
    | 'disableRealtimeUpdates'
    | 'disableAutomaticEventLogging'
    | 'disableCustomEventLogging'
> & {
    configSource?: ConfigSource
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const appWithDevCycle = <Props extends NextJsAppProps>(
    WrappedComponent: React.ComponentType<Props>,
    additionalOptions: DevCycleNextOptions = {},
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
                    user: devcycleSSR.user,
                    options: {
                        ...additionalOptions,
                        ...(onServerside
                            ? {
                                  disableAutomaticEventLogging: true,
                                  disableCustomEventLogging: true,
                                  disableRealtimeUpdates: true,
                              }
                            : {}),
                        sdkPlatform: 'nextjs',
                        disableConfigCache: true,
                        bootstrapConfig:
                            devcycleSSR.bucketedConfig ?? undefined,
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
