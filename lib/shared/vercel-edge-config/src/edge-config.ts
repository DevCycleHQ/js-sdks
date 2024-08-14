import { ConfigSource, UserError } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'
import { ConfigBody } from '@devcycle/types'

export class EdgeConfigSource extends ConfigSource {
    constructor(private edgeConfigClient: EdgeConfigClient) {
        super()
    }

    async getConfig<T extends boolean>(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
        skipLastModified?: T,
    ): Promise<{
        config: T extends true ? ConfigBody : ConfigBody | null
        metaData: Record<string, unknown>
        lastModified: string | null
    }> {
        const configPath = this.getConfigURL(sdkKey, kind, obfuscated)
        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        if (!config) {
            throw new UserError(
                `Invalid SDK key provided, or edge config integration is not setup: ${sdkKey}`,
            )
        }

        const lastModified = config['lastModified'] as string

        if (!skipLastModified && this.isLastModifiedHeaderOld(lastModified)) {
            return {
                // type hackery to make it accept the return type when skipLastModified is false
                config: null as T extends true ? never : ConfigBody | null,
                metaData: {
                    resLastModified: lastModified,
                },
                lastModified,
            }
        }

        this.configLastModified = config['lastModified'] as string

        return {
            config: config as unknown as ConfigBody,
            metaData: { resLastModified: this.configLastModified },
            lastModified: this.configLastModified,
        }
    }

    getConfigURL(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated?: boolean,
    ): string {
        return kind == 'bootstrap'
            ? `devcycle-config-v2-server-bootstrap${
                  obfuscated ? '-obfuscated' : ''
              }-${sdkKey}`
            : `devcycle-config-v2-server-${sdkKey}`
    }
}
