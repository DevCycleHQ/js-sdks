import type { getDevCycleServerData } from '../server/devcycleServerData'
import { DevCycleOptions } from '@devcycle/js-client-sdk'

export type DevCycleNextOptions = Pick<
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
    /**
     * Make the SDK's initialization non-blocking. This unblocks serverside rendering up to the point of a variable
     * evaluation, and allows the use of a Suspense boundary to stream flagged components to the client when the
     * configuration is ready.
     *
     * When this is enabled, client components will initially render using default variable values,
     * and will re-render when the configuration is ready.
     */
    enableStreaming?: boolean

    /**
     * Used to disable any SDK features that require dynamic request context. This allows the SDK to be used in pages
     * that are intended to be statically generated, as long as nothing else on that page consumes request details
     * like headers or cookies.
     * This option will disable the following features:
     * - automatic user agent parsing to populate targeting rule data for Platform Version and Device Model
     *
     */
    staticMode?: boolean
}

export type DevCycleServerData = Awaited<
    ReturnType<typeof getDevCycleServerData>
>
