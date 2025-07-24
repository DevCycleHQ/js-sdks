import { EnvironmentConfigManager } from '@devcycle/config-manager'
import { DVCLogger, ConfigBody } from '@devcycle/types'
import { ConfigMetadata } from './ConfigMetadata'

type SetConfigBufferInterface = (sdkKey: string, projectConfig: string) => void
type SetIntervalInterface = (handler: () => void, timeout?: number) => any
type ClearIntervalInterface = (intervalTimeout: any) => void
type TrackSDKConfigEventInterface = (
    url: string,
    responseTimeMS: number,
    retrievalMetadata?: Record<string, unknown>,
    err?: any,
    reqEtag?: string,
    reqLastModified?: string,
    sseConnected?: boolean,
) => void

type ConfigPollingOptions = {
    configPollingIntervalMS?: number
    sseConfigPollingIntervalMS?: number
    configPollingTimeoutMS?: number
    configCDNURI?: string
    clientMode?: boolean
    disableRealTimeUpdates?: boolean
}

export class ConfigManagerWrapper {
    private configManager: EnvironmentConfigManager
    private configMetadata: ConfigMetadata | null = null

    constructor(
        logger: DVCLogger,
        sdkKey: string,
        setConfigBuffer: SetConfigBufferInterface,
        setInterval: SetIntervalInterface,
        clearInterval: ClearIntervalInterface,
        trackSDKConfigEvent: TrackSDKConfigEventInterface,
        options: ConfigPollingOptions,
        configSource?: any,
    ) {
        // Create a custom setConfigBuffer that captures metadata
        const enhancedSetConfigBuffer: SetConfigBufferInterface = (sdkKey: string, projectConfig: string) => {
            try {
                // Parse the config to extract project and environment data
                const config = JSON.parse(projectConfig) as ConfigBody
                
                // Extract ETag and Last-Modified from the config source
                const etag = configSource?.configEtag || ''
                const lastModified = configSource?.configLastModified || ''
                
                if (etag && lastModified && config.project && config.environment) {
                    this.configMetadata = new ConfigMetadata(
                        etag,
                        lastModified,
                        { id: config.project._id, key: config.project.key },
                        { id: config.environment._id, key: config.environment.key },
                    )
                }
            } catch (error) {
                // If parsing fails, we'll keep the existing metadata or create a default one
                logger.debug('Failed to parse config for metadata extraction', error)
            }
            
            // Call the original setConfigBuffer function
            setConfigBuffer(sdkKey, projectConfig)
        }

        this.configManager = new EnvironmentConfigManager(
            logger,
            sdkKey,
            enhancedSetConfigBuffer,
            setInterval,
            clearInterval,
            trackSDKConfigEvent,
            options,
            configSource,
        )
    }

    /**
     * Update config metadata with actual project and environment data
     */
    updateConfigMetadata(config: ConfigBody): void {
        if (this.configMetadata) {
            this.configMetadata = new ConfigMetadata(
                this.configMetadata.configETag,
                this.configMetadata.configLastModified,
                { id: config.project._id, key: config.project.key },
                { id: config.environment._id, key: config.environment.key },
            )
        }
    }

    /**
     * Get the current config metadata
     */
    getConfigMetadata(): ConfigMetadata | null {
        return this.configMetadata
    }

    /**
     * Delegate all other methods to the underlying config manager
     */
    get hasConfig(): boolean {
        return this.configManager.hasConfig
    }

    get configEtag(): string | undefined {
        return this.configManager.configEtag
    }

    get fetchConfigPromise(): Promise<void> {
        return this.configManager.fetchConfigPromise
    }

    cleanup(): void {
        this.configManager.cleanup()
    }
}