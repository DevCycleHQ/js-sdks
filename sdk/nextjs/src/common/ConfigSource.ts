import { ConfigBody } from '@devcycle/types'

export abstract class ConfigSource {
    /**
     * Method to get the config from the source.
     * Should return null if the config has not changed, and throw an error if it could not be retrieved.
     * @param sdkKey
     * @param kind
     * @param obfuscated
     * @param lastModifiedThreshold
     */
    abstract getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
    ): Promise<{ config: ConfigBody; lastModified: string | null }>
}
