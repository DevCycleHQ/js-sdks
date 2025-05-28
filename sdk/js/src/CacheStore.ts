import type { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCStorage, StoreKey } from './types'
import { DVCPopulatedUser } from './User'

const DEFAULT_CONFIG_CACHE_TTL = 604800000; // 7 days in milliseconds

export class CacheStore {
    store: DVCStorage
    logger: DVCLogger

    constructor(storage: DVCStorage, logger: DVCLogger) {
        this.store = storage
        this.logger = logger
    }

    private getConfigKey(user: DVCPopulatedUser) {
        return user.isAnonymous
            ? StoreKey.AnonymousConfig
            : StoreKey.IdentifiedConfig
    }

    private getConfigUserIdKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.user_id`
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.fetch_date`
    }

    private async loadConfigUserId(
        user: DVCPopulatedUser,
    ): Promise<string | undefined> {
        const userIdKey = this.getConfigUserIdKey(user)
        return await this.store.load<string>(userIdKey)
    }

    private async loadConfigFetchDate(user: DVCPopulatedUser): Promise<number> {
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const fetchDate = (await this.store.load<string>(fetchDateKey)) || '0'
        return parseInt(fetchDate, 10)
    }

    async saveConfig(
        data: BucketedUserConfig,
        user: DVCPopulatedUser,
        dateFetched: number,
    ): Promise<void> {
        const configKey = this.getConfigKey(user)
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const userIdKey = this.getConfigUserIdKey(user)
        await Promise.all([
            this.store.save(configKey, data),
            this.store.save(fetchDateKey, dateFetched),
            this.store.save(userIdKey, user.user_id),
        ])
        this.logger?.info('Successfully saved config to local storage')
    }

    private isBucketedUserConfig(
        object: unknown,
    ): object is BucketedUserConfig {
        if (!object || typeof object !== 'object') return false
        return (
            'features' in object &&
            'project' in object &&
            'environment' in object &&
            'featureVariationMap' in object &&
            'variableVariationMap' in object &&
            'variables' in object
        )
    }

    async loadConfig(
        user: DVCPopulatedUser,
        configCacheTTL = DEFAULT_CONFIG_CACHE_TTL,
    ): Promise<BucketedUserConfig | null> {
        const userId = await this.loadConfigUserId(user)
        if (user.user_id !== userId) {
            this.logger?.debug(
                `Skipping cached config: no config for user ID ${user.user_id}`,
            )
            return null
        }

        const cachedFetchDate = await this.loadConfigFetchDate(user)
        const isConfigCacheTTLExpired =
            Date.now() - cachedFetchDate > configCacheTTL
        if (isConfigCacheTTLExpired) {
            this.logger?.debug(
                'Skipping cached config: last fetched date is too old',
            )
            return null
        }

        const configKey = await this.getConfigKey(user)
        const config = await this.store.load<unknown>(configKey)
        if (config === null || config === undefined) {
            this.logger?.debug('Skipping cached config: no config found')
            return null
        }
        if (!this.isBucketedUserConfig(config)) {
            this.logger?.debug(
                `Skipping cached config: invalid config found: ${JSON.stringify(
                    config,
                )}`,
            )
            return null
        }

        return config
    }

    async saveUser(user: DVCPopulatedUser): Promise<void> {
        if (!user) {
            throw new Error('No user to save')
        }
        await this.store.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    async loadUser(): Promise<DVCPopulatedUser | undefined> {
        return await this.store.load<DVCPopulatedUser>(StoreKey.User)
    }

    async saveAnonUserId(userId: string): Promise<void> {
        await this.store.save(StoreKey.AnonUserId, userId)
        this.logger?.info(
            'Successfully saved anonymous user id to local storage',
        )
    }

    async loadAnonUserId(): Promise<string | undefined> {
        return await this.store.load<string>(StoreKey.AnonUserId)
    }

    async removeAnonUserId(): Promise<void> {
        await this.store.remove(StoreKey.AnonUserId)
    }
}

export default CacheStore
