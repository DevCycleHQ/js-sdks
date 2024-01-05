import React, { Suspense, use } from 'react'
import { DevCycleServerData } from '../common/types'
import { InternalDevCycleClientsideProvider } from './internal/InternalDevCycleClientsideProvider'

export type DevCycleClientContext = {
    serverDataPromise: Promise<DevCycleServerData>
    sdkKey: string
    enableStreaming: boolean
    userAgent?: string
}

type DevCycleClientsideProviderProps = {
    context: DevCycleClientContext
    children: React.ReactNode
}

let promiseResolved = false

/**
 * Component which renders nothing but "awaits" the promise to trigger a suspense if it is not yet resolved
 * If it is resolved, then a global variable is flipped which is passed to the InternalDevCycleClientsideProvider,
 * telling it to "use" the promise to obtain the resolved value in the first render pass.
 * This is to work around cases where the initialize promise has resolved by now due to layouts rendering after pages
 * so the server is already rendering with variable values, but the client provider won't otherwise
 * use those values on the first pass. We can't always "use"  the promise inside the provider
 * because in streaming mode that would sometimes block rendering unless the provider was inside a suspense
 * @param promise
 * @constructor
 */
const PromiseResolver = async ({ promise }: { promise: Promise<unknown> }) => {
    await promise
    promiseResolved = true
    return null
}

const promiseResolvedValue = (): boolean => {
    const previouslyResolved = promiseResolved
    promiseResolved = false
    return previouslyResolved
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

    return (
        <>
            <Suspense>
                <PromiseResolver promise={context.serverDataPromise} />
            </Suspense>
            <InternalDevCycleClientsideProvider
                context={clientsideContext}
                promiseResolved={promiseResolvedValue()}
            >
                {children}
            </InternalDevCycleClientsideProvider>
        </>
    )
}
