import { ConfigBody } from '@devcycle/types'

export abstract class ConfigSource {
    configEtag?: string
    configLastModified?: string

    /**
     * Method to get the config from the source.
     * Should return null if the config has not changed, and throw an error if it could not be retrieved.
     * @param sdkKey
     * @param lastModifiedThreshold
     */
    abstract getConfig(
        sdkKey: string,
        lastModifiedThreshold?: string,
    ): Promise<[ConfigBody | null, Record<string, unknown>]>

    /**
     * Return the URL (or path or storage key etc.) that will be used to retrieve the config for the given SDK key
     * @param sdkKey
     */
    abstract getConfigURL(sdkKey: string): string
}
