import type { BucketedUserConfig } from '@devcycle/types'
import { DVCPopulatedUser } from './User'

type PromiseResolver = {
    resolve: (value: BucketedUserConfig) => void
    reject: (err?: any) => void
}

type RequestParams = { sse: boolean; lastModified?: number; etag?: string }

/**
 * Ensures we only have one active config request at a time
 * any calls made while another is ongoing will be merged together by using the latest user object provided
 */
export class ConfigRequestConsolidator {
    currentPromise: Promise<BucketedUserConfig> | null
    resolvers: PromiseResolver[] = []
    requestParams: RequestParams | null = null

    constructor(
        private requestConfigFunction: (
            user: DVCPopulatedUser,
            params?: RequestParams,
        ) => Promise<BucketedUserConfig>,
        private handleConfigReceivedFunction: (
            config: BucketedUserConfig,
            user: DVCPopulatedUser,
        ) => Promise<void>,
        private nextUser: DVCPopulatedUser,
    ) {}

    async queue(
        user: DVCPopulatedUser | null,
        requestParams?: RequestParams,
    ): Promise<BucketedUserConfig> {
        if (user) {
            this.nextUser = user
        }

        if (requestParams) {
            this.requestParams = requestParams
        }

        const resolver = new Promise<BucketedUserConfig>((resolve, reject) => {
            this.resolvers.push({
                resolve,
                reject,
            })
        })

        if (!this.currentPromise) {
            this.processQueue()
        }

        return resolver
    }

    private async processQueue(): Promise<void> {
        if (!this.resolvers.length) {
            return
        }

        const resolvers = this.resolvers.splice(0)
        await this.performRequest(this.nextUser)
            .then(async (result) => {
                if (this.resolvers.length) {
                    // if more resolvers have been registered since this request was made,
                    // don't resolve anything and just make another request while keeping all the previous resolvers
                    this.resolvers.push(...resolvers)
                } else {
                    await this.handleConfigReceivedFunction(
                        result,
                        this.nextUser,
                    )
                    resolvers.forEach(({ resolve }) => resolve(result))
                }
            })
            .catch((err) => {
                resolvers.forEach(({ reject }) => reject(err))
            })

        if (this.resolvers.length) {
            this.processQueue()
        }
    }

    private async performRequest(
        user: DVCPopulatedUser,
    ): Promise<BucketedUserConfig> {
        this.currentPromise = this.requestConfigFunction(
            user,
            this.requestParams ? this.requestParams : undefined,
        )
        this.requestParams = null
        const bucketedConfig = await this.currentPromise
        this.currentPromise = null
        return bucketedConfig
    }
}
