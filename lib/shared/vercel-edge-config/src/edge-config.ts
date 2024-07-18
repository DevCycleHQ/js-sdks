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
    ): Promise<[ConfigBody | null, Record<string, unknown>]> {
        const configPath = this.getConfigURL(sdkKey, kind)
        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        if (!config) {
            throw new UserError(`Invalid SDK key provided: ${sdkKey}`)
        }

        const lastModified = config['lastModified'] as string

        if (this.isLastModifiedHeaderOld(lastModified)) {
            return [null, { resLastModified: lastModified }]
        }

        this.configLastModified = config['lastModified'] as string
        return [
            config as unknown as ConfigBody,
            { resLastModified: this.configLastModified },
        ]
    }

    getConfigURL(sdkKey: string, kind: 'server' | 'bootstrap'): string {
        return kind == 'bootstrap'
            ? `devcycle-config-v1-server-bootstrap-${sdkKey}`
            : `devcycle-config-v1-server-${sdkKey}`
    }
}
