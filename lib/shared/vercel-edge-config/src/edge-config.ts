import { ConfigSource } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'
import { ConfigBody } from '@devcycle/types'

export class EdgeConfigSource implements ConfigSource {
    configLastModified?: string

    constructor(
        private edgeConfigClient: EdgeConfigClient,
        private kind: 'server' | 'bootstrap',
    ) {}

    async getConfig(
        sdkKey: string,
    ): Promise<[ConfigBody | null, Record<string, unknown>]> {
        const configPath = this.getConfigURL(sdkKey)
        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        if (config) {
            this.configLastModified = config['lastModified'] as string
            return [
                config as unknown as ConfigBody,
                { resLastModified: this.configLastModified },
            ]
        }
        return [null, {}]
    }

    getConfigURL(sdkKey: string): string {
        return this.kind == 'server'
            ? `devcycle-config-v1-server-${sdkKey}`
            : `devcycle-config-v1-server-bootstrap-${sdkKey}`
    }
}
