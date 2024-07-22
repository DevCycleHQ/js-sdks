import { ConfigSource, UserError } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'
import { ConfigBody } from '@devcycle/types'

export class EdgeConfigSource extends ConfigSource {
    constructor(private edgeConfigClient: EdgeConfigClient) {
        super()
    }

    async getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
    ): Promise<{
        config: ConfigBody | null
        metaData: Record<string, unknown>
        lastModified: string | null
    }> {
        const configPath = this.getConfigURL(sdkKey, kind, obfuscated)
        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        if (!config) {
            throw new UserError(`Invalid SDK key provided: ${sdkKey}`)
        }

        const lastModified = config['lastModified'] as string

        if (this.isLastModifiedHeaderOld(lastModified)) {
            return {
                config: null,
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
            ? `devcycle-config-v1-server-bootstrap${
                  obfuscated ? '-obfuscated' : ''
              }-${sdkKey}`
            : `devcycle-config-v1-server-${sdkKey}`
    }
}
