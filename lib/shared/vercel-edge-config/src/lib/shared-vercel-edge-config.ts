import { ConfigSource } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'

class EdgeConfigSource implements ConfigSource {
    configEtag?: string
    configLastModified?: string
  
    constructor(
        private edgeConfigClient: EdgeConfigClient,
        private kind: 'server' | 'bootstrap',
    ) {}

    async getConfig(sdkKey: string) {
        const configPath = this.getConfigURL(sdkKey)
        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        if (config) {
            this.configEtag = config['etag'] as string
            this.configLastModified = config['last-modified'] as string
            return JSON.parse(JSON.stringify(config))
        }
        return null
    }

    getConfigURL(sdkKey: string) {
        return this.kind == 'server'
            ? `devcycle/config/v1/server/${sdkKey}.json`
            : `devcycle/config/v1/client/bootstrap/${sdkKey}.json`
    }
}
