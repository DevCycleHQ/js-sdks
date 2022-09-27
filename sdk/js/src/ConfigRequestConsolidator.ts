import { BucketedUserConfig } from '@devcycle/types'
import { DVCPopulatedUser } from './User'

type PromiseResolver = {
    resolve: (value: BucketedUserConfig) => void
    reject: (err?: any) => void
}

/**
 * Ensures we only have one active config request at a time
 * any calls made while another is ongoing will be merged together by using the latest user object provided
 */
export class ConfigRequestConsolidator {
    currentPromise: Promise<BucketedUserConfig> | null
    resolvers: PromiseResolver[] = []

    constructor(
        private requestConfigFunction: (user: DVCPopulatedUser) => Promise<BucketedUserConfig>,
        private handleConfigReceivedFunction: (user: DVCPopulatedUser, config: BucketedUserConfig) => void,
        private nextUser: DVCPopulatedUser
    ) {}

    async queue(user?: DVCPopulatedUser): Promise<BucketedUserConfig> {
        if (user) {
            this.nextUser = user
        }

        const resolver = new Promise<BucketedUserConfig>((resolve, reject) => {
            this.resolvers.push({
                resolve, reject
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
        await this.performRequest(this.nextUser).then((result) => {
            resolvers.forEach(({ resolve }) => resolve(result))
        }).catch((err) => {
            resolvers.forEach(({ reject }) => reject(err))
        })

        if (this.resolvers.length) {
            this.processQueue()
        }
    }

    private async performRequest(user: DVCPopulatedUser): Promise<BucketedUserConfig> {
        this.currentPromise = this.requestConfigFunction(user)
        const bucketedConfig = await this.currentPromise
        this.currentPromise = null
        this.handleConfigReceivedFunction(user, bucketedConfig)
        return bucketedConfig
    }
}
