import { ConfigBody } from '@devcycle/types'
import { isValidDate } from './request'

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
     */
    abstract getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
    ): Promise<{
        config: ConfigBody | null
        metaData: Record<string, unknown>
        lastModified: string | null
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
