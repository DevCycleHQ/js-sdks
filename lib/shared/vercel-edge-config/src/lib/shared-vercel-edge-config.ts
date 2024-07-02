import { ConfigSource } from '@devcycle/nodejs-server-sdk'
import { EdgeConfigClient, EdgeConfigValue } from '@vercel/edge-config'

class EdgeConfigSource implements ConfigSource {
    constructor(
        private edgeConfigClient: EdgeConfigClient,
        private kind: 'server' | 'bootstrap',
    ) {}

    async getConfig(sdkKey: string) {
        const configPath =
            this.kind == 'server'
                ? `devcycle/config/v1/server/${sdkKey}.json`
                : `devcycle/config/v1/client/bootstrap/${sdkKey}.json`

        const config = await this.edgeConfigClient.get<{
            [x: string]: EdgeConfigValue
        }>(configPath)

        return config
    }
}
