import type { AppProps as NextJsAppProps } from 'next/app'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { SSRProps } from './types'
import { DevCycleProvider, useDevCycleClient } from '@devcycle/react-client-sdk'
import React, { useEffect, useRef } from 'react'
import { DevCycleOptions } from '@devcycle/js-client-sdk'

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
>

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
    const isInitializedRef = useRef(false)

    if (!isInitializedRef.current) {
        client.synchronizeBootstrapData(
            devcycleSSR.bucketedConfig,
            devcycleSSR.user,
            devcycleSSR.userAgent ?? undefined,
        )
        isInitializedRef.current = true
    }

    useEffect(() => {
        if (!isInitializedRef.current) {
            client.synchronizeBootstrapData(
                devcycleSSR.bucketedConfig,
                devcycleSSR.user,
                devcycleSSR.userAgent ?? undefined,
            )
            isInitializedRef.current = true
        }
        return () => {
            isInitializedRef.current = false
        }
    }, [
        devcycleSSR.bucketedConfig,
        devcycleSSR.sdkKey,
        devcycleSSR.user,
        devcycleSSR.userAgent,
        client,
    ])

    return children
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
                    options: {
                        ...additionalOptions,
                        sdkPlatform: 'nextjs',
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
