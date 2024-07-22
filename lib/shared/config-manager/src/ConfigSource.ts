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
     * @param lastModifiedThreshold
     */
    abstract getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        lastModifiedThreshold?: string,
    ): Promise<[ConfigBody | null, Record<string, unknown>]>

    /**
     * Return the URL (or path or storage key etc.) that will be used to retrieve the config for the given SDK key
     * @param sdkKey
     * @param kind
     */
    abstract getConfigURL(sdkKey: string, kind: 'server' | 'bootstrap'): string

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
