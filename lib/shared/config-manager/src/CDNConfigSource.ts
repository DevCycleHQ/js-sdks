import { ConfigBody, DVCLogger, ConfigSource, UserError } from '@devcycle/types'
import { getEnvironmentConfig } from './request'
import { ResponseError } from '@devcycle/server-request'

export class CDNConfigSource extends ConfigSource {
    constructor(
        private cdnURI: string,
        private logger: DVCLogger,
        private requestTimeoutMS: number,
    ) {
        super()
    }

    // type generic to make typescript happy. It's always false in this implementation
    async getConfig<T extends boolean = false>(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
    ): Promise<{
        config: T extends true ? ConfigBody : ConfigBody | null
        metaData: Record<string, unknown>
        lastModified: string | null
    }> {
        let res: Response
        try {
            res = await getEnvironmentConfig({
                logger: this.logger,
                url: this.getConfigURL(sdkKey, kind),
                requestTimeout: this.requestTimeoutMS,
                currentEtag: this.configEtag,
                currentLastModified: this.configLastModified,
                sseLastModified: lastModifiedThreshold,
            })
        } catch (e) {
            if (e instanceof ResponseError && e.status === 403) {
                throw new UserError(`Invalid SDK key provided: ${sdkKey}`)
            }
            throw e
        }
        const metadata: Record<string, string | undefined | number> = {
            resEtag: res.headers.get('etag') ?? undefined,
            resLastModified: res.headers.get('last-modified') ?? undefined,
            resRayId: res.headers.get('cf-ray') ?? undefined,
            resStatus: res.status ?? undefined,
        }
        res.headers.forEach((value, name) => {
            metadata[`resHeader_` + name] = value
        })

        this.logger.debug(
            `Downloaded config, status: ${
                res?.status
            }, etag: ${res?.headers.get('etag')}`,
        )

        if (res.status === 304) {
            this.logger.debug(
                `Config not modified, using cache, etag: ${this.configEtag}` +
                    `, last-modified: ${this.configLastModified}`,
            )
        } else if (res.status === 200) {
            const projectConfig = (await res.json()) as unknown

            const lastModifiedHeader = res.headers.get('last-modified')
            if (this.isLastModifiedHeaderOld(lastModifiedHeader ?? null)) {
                this.logger.debug(
                    'Skipping saving config, existing last modified date is newer.',
                )
                return {
                    config: null as T extends true
                        ? ConfigBody
                        : ConfigBody | null,
                    metaData: metadata,
                    lastModified: lastModifiedHeader,
                }
            }
            this.configEtag = res.headers.get('etag') || ''
            this.configLastModified = lastModifiedHeader || ''
            return {
                config: projectConfig as ConfigBody,
                metaData: metadata,
                lastModified: lastModifiedHeader,
            }
        }
        return {
            config: null as T extends true ? ConfigBody : ConfigBody | null,
            metaData: metadata,
            lastModified: null,
        }
    }

    getConfigURL(sdkKey: string, kind: 'server' | 'bootstrap'): string {
        if (kind === 'bootstrap') {
            return `${this.cdnURI}/config/v2/server/bootstrap/${sdkKey}.json`
        }
        return `${this.cdnURI}/config/v2/server/${sdkKey}.json`
    }
}
