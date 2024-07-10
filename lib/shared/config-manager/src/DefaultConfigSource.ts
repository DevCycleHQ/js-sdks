import { ConfigBody, DVCLogger } from "@devcycle/types"
import { ConfigSource } from "./ConfigSource"
import { getEnvironmentConfig } from "./request"

export class DefaultConfigSource implements ConfigSource {
  configEtag?: string
  configLastModified?: string

  constructor(
      private cdnURI: string,
      private clientMode: boolean,
      private logger: DVCLogger,
      private requestTimeoutMS: number,
  ) {}

  async getConfig(
      sdkKey: string,
      currentEtag?: string,
      currentLastModified?: string,
      lastModifiedThreshold?: string,
  ): Promise<ConfigBody | null> {
      const res = await getEnvironmentConfig({
          logger: this.logger,
          url: this.getConfigURL(sdkKey),
          requestTimeout: this.requestTimeoutMS,
          currentEtag,
          currentLastModified,
          sseLastModified: lastModifiedThreshold,
      })

      const projectConfig = await res.text()

      this.logger.debug(
          `Downloaded config, status: ${
              res?.status
          }, etag: ${res?.headers.get('etag')}`,
      )

      if (res?.status === 304) {
          this.logger.debug(
              `Config not modified, using cache, etag: ${this.configEtag}` +
                  `, last-modified: ${this.configLastModified}`,
          )
      } else if (res?.status === 200 && projectConfig) {
          const lastModifiedHeader = res?.headers.get('last-modified')
          this.configEtag = res?.headers.get('etag') || ''
          this.configLastModified = lastModifiedHeader || ''
          return JSON.parse(projectConfig)
      }
      return null
  }

  getConfigURL(sdkKey: string): string {
      if (this.clientMode) {
          return `${this.cdnURI}/config/v1/server/bootstrap/${sdkKey}.json`
      }
      return `${this.cdnURI}/config/v1/server/${sdkKey}.json`
  }
}
