import { ConfigBody } from './config/configBody'

export const isValidDate = (date: Date | null): date is Date =>
    date instanceof Date && !isNaN(date.getTime())

/**
 * Interface representing a source to pull config data from. Used by the Node and Next SDKs
 */
export abstract class ConfigSource {
    configEtag?: string
    configLastModified?: string

    /**
     * Method to get the config from the source.
     * Should return null if the config has not changed, and throw an error if it could not be retrieved.
     * @param sdkKey
     * @param kind
     * @param obfuscated
     * @param lastModifiedThreshold
     * @param skipLastModified
     */
    abstract getConfig<T extends boolean = false>(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
        skipLastModified?: T,
    ): Promise<{
        config: T extends true ? ConfigBody : ConfigBody | null
        lastModified: string | null
        metaData: Record<string, unknown>
    }>

    /**
     * Return the URL (or path or storage key etc.) that will be used to retrieve the config for the given SDK key
     * @param sdkKey
     * @param kind
     * @param obfuscated
     */
    abstract getConfigURL(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
    ): string

    protected isLastModifiedHeaderOld(
        lastModifiedHeader: string | null,
    ): boolean {
        const lastModifiedHeaderDate = lastModifiedHeader
            ? new Date(lastModifiedHeader)
            : null
        const configLastModifiedDate = this.configLastModified
            ? new Date(this.configLastModified)
            : null

        return (
            isValidDate(configLastModifiedDate) &&
            isValidDate(lastModifiedHeaderDate) &&
            lastModifiedHeaderDate <= configLastModifiedDate
        )
    }
}
