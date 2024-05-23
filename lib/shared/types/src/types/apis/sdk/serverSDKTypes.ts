import { DVCLogger, DVCDefaultLogLevel } from '../../../logger'
import { DVCReporter } from '../../../reporter'

/**
 * Options to control the setup of the DevCycle NodeJS Server SDK.
 */
export interface DevCycleServerSDKOptions {
    /**
     * Logger override to replace default logger
     */
    logger?: DVCLogger

    /**
     * Metrics reporter to capture data about event processing
     */
    reporter?: DVCReporter

    /**
     * Set log level of the default logger
     */
    logLevel?: DVCDefaultLogLevel

    /**
     * Switches the SDK to use Cloud Bucketing (via the DevCycle Bucketing API) instead of Local Bucketing.
     */
    enableCloudBucketing?: boolean

    /**
     * Enables the usage of EdgeDB for DevCycle that syncs User Data to DevCycle.
     * NOTE: This is only available with Cloud Bucketing.
     */
    enableEdgeDB?: boolean

    /**
     * Controls the polling interval in milliseconds to fetch new environment config changes, defaults to 10 seconds.
     * @min 1000
     */
    configPollingIntervalMS?: number

    /**
     * Controls the request timeout to fetch new environment config changes, defaults to 5 seconds,
     * must be less than the configPollingIntervalMS value.
     * @min 1000
     */
    configPollingTimeoutMS?: number

    /**
     * Controls the interval between flushing events to the DevCycle servers, defaults to 30 seconds.
     */
    eventFlushIntervalMS?: number

    /**
     * Disables logging of sdk generated events (e.g. aggVariableEvaluated, aggVariableDefaulted) to DevCycle.
     */
    disableAutomaticEventLogging?: boolean

    /**
     * Disables logging of custom events or user data to DevCycle.
     */
    disableCustomEventLogging?: boolean

    /**
     * Controls the maximum size the event queue can grow to until a flush is forced. Defaults to `1000`.
     */
    flushEventQueueSize?: number

    /**
     * Controls the maximum size the event queue can grow to until events are dropped. Defaults to `2000`.
     */
    maxEventQueueSize?: number

    /**
     * Allows the SDK to communicate with a proxy of DVC bucketing API / client SDK API. Overrides the base URL.
     */
    bucketingAPIURI?: string

    /**
     * Overrides the default URL for the DVC Events API when using local bucketing.
     */
    eventsAPIURI?: string

    /**
     * Overrides the default URL for the DVC Config CDN when using local bucketing.
     */
    configCDNURI?: string

    /**
     * Enable the ability to create a client configuration for use as a bootstrapping config
     * Useful for serverside-rendering usecases where the config can be obtained on the server
     * and provided to the client
     */
    enableClientBootstrapping?: boolean

    /**
     * BETA: Enable Real Time Updates and their associated SSE connection
     */
    betaEnableRealTimeUpdates?: boolean

    /**
     * Controls the polling interval in milliseconds to fetch new environment config changes
     * when SSE connections are enabled, defaults to 10 minutes.
     * This is only used when betaEnableRealTimeUpdates is true.
     * @min 60000
     */
    sseConfigPollingIntervalMS?: number
}
