import { ConfigBody } from "@devcycle/types";

export abstract class ConfigSource {
  configEtag?: string
  configLastModified?: string

  abstract getConfig(
      sdkKey: string,
      currentEtag?: string,
      currentLastModified?: string,
      lastModifiedThreshold?: string,
  ): Promise<ConfigBody | null>

  abstract getConfigURL(sdkKey: string): string
}
