import { ConfigBody, DVCLogger } from '@devcycle/types'
import { ConfigSource } from './ConfigSource'
import { getEnvironmentConfig } from './request'
import { ResponseError, UserError } from '@devcycle/server-request'

export class CDNConfigSource extends ConfigSource {
    constructor(
        private cdnURI: string,
        private logger: DVCLogger,
        private requestTimeoutMS: number,
    ) {
        super()
    }

    async getConfig(
        sdkKey: string,
        kind: 'server' | 'bootstrap',
        obfuscated: boolean,
        lastModifiedThreshold?: string,
    ): Promise<[ConfigBody | null, Record<string, unknown>]> {
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

        const metadata = {
            resEtag: res.headers.get('etag') ?? undefined,
            resLastModified: res.headers.get('last-modified') ?? undefined,
            resRayId: res.headers.get('cf-ray') ?? undefined,
            resStatus: res.status ?? undefined,
        }

        const projectConfig = (await res.json()) as unknown

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
        } else if (res.status === 200 && projectConfig) {
            const lastModifiedHeader = res.headers.get('last-modified')
            if (this.isLastModifiedHeaderOld(lastModifiedHeader ?? null)) {
                this.logger.debug(
                    'Skipping saving config, existing last modified date is newer.',
                )
                return [null, metadata]
            }
            this.configEtag = res.headers.get('etag') || ''
            this.configLastModified = lastModifiedHeader || ''
            return [projectConfig as ConfigBody, metadata]
        }
        return [null, metadata]
    }

    getConfigURL(sdkKey: string, kind: 'server' | 'bootstrap'): string {
        if (kind === 'bootstrap') {
            return `${this.cdnURI}/config/v1/server/bootstrap/${sdkKey}.json`
        }
        return `${this.cdnURI}/config/v1/server/${sdkKey}.json`
    }
}
