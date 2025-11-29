import {
    DevCycleOptions,
    DevCycleUser,
    DevCycleEvent,
} from '@devcycle/js-client-sdk'
import {
    BucketedUserConfig,
    ConfigSource,
    InferredVariableType,
    VariableDefinitions,
    VariableKey,
} from '@devcycle/types'

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
    | 'enableObfuscation'
    | 'enableEdgeDB'
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
     * - web-debugger user override for server-side evaluations
     *
     */
    staticMode?: boolean

    /**
     * Replace the default source for DevCycle configuration with an alternative
     */
    configSource?: ConfigSource
}

export type BucketedConfigWithAdditionalFields = BucketedUserConfig & {
    lastModified?: string
    clientSDKKey: string
}

export type DevCycleServerData = {
    user: DevCycleUser
    // this is null if the config failed to be fetched
    config: BucketedConfigWithAdditionalFields | null

    userAgent: string | undefined
}

export type { DevCycleEvent }

export type GetVariableValue = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: ValueType,
) => Promise<InferredVariableType<K, ValueType>>
