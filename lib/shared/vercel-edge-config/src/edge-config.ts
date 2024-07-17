import { ConfigSource } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'
import { ConfigBody } from '@devcycle/types'
import { UserError } from '@devcycle/server-request'

export class EdgeConfigSource extends ConfigSource {
    constructor(
        private edgeConfigClient: EdgeConfigClient,
        private kind: 'server' | 'bootstrap',
    ) {
        super()
    }

    async getConfig(
        sdkKey: string,
    ): Promise<[ConfigBody | null, Record<string, unknown>]> {
        const configPath = this.getConfigURL(sdkKey)
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

    getConfigURL(sdkKey: string): string {
        return this.kind == 'server'
            ? `devcycle-config-v1-server-${sdkKey}`
            : `devcycle-config-v1-server-bootstrap-${sdkKey}`
    }
}
