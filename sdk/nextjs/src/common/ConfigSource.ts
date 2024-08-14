import { ConfigBody } from '@devcycle/types'

export abstract class ConfigSource {
    /**
     * Method to get the config from the source.
     * Should return null if the config has not changed, and throw an error if it could not be retrieved.
     * @param sdkKey
     * @param kind
     * @param obfuscated
     * @param lastModifiedThreshold
     * @param skipLastModified
     */
    abstract getConfig<T extends boolean>(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
        skipLastModified?: T,
    ): Promise<{
        config: T extends true ? ConfigBody : ConfigBody | null
        lastModified: string | null
    }>
}
