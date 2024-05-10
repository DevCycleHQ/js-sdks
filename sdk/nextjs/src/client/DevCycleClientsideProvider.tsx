import React from 'react'
import { DevCycleNextOptions, DevCycleServerData } from '../common/types'
import { InternalDevCycleClientsideProvider } from './internal/InternalDevCycleClientsideProvider'

export type DevCycleClientContext = {
    serverDataPromise: Promise<DevCycleServerData>
    clientSDKKey: string
    enableStreaming: boolean
    options: DevCycleNextOptions
    userAgent?: string
}

type DevCycleClientsideProviderProps = {
    context: DevCycleClientContext
    children: React.ReactNode
}

/**
 * Function which synchronously checks if the promise is resolved
 * If it is resolved, then a true is returned which is passed to the InternalDevCycleClientsideProvider,
 * telling it to "use" the promise to obtain the resolved value in the first render pass.
 * This is to work around cases where the initialize promise has resolved by now due to layouts rendering after pages
 * so the server is already rendering with variable values, but the client provider won't otherwise
 * use those values on the first pass. We can't always "use"  the promise inside the provider
 * because in streaming mode that would sometimes block rendering unless the provider was inside a suspense
 * @param promise
 * @constructor
 */
const checkIfPromiseResolved = (promise: Promise<unknown>) => {
    let promiseResolved = false
    promise.then(() => {
        promiseResolved = true
    })
    return promiseResolved
}

export const DevCycleClientsideProvider = async ({
    context,
    children,
}: DevCycleClientsideProviderProps): Promise<React.ReactElement> => {
    const clientsideContext = {
        ...context,
        serverData: context.enableStreaming
            ? undefined
            : await context.serverDataPromise,
    }

    const promiseResolved = checkIfPromiseResolved(context.serverDataPromise)

    return (
        <InternalDevCycleClientsideProvider
            context={clientsideContext}
            promiseResolved={promiseResolved}
        >
            {children}
        </InternalDevCycleClientsideProvider>
    )
}
