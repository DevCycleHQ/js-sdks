import type { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCStorage, StoreKey } from './types'
import { DVCPopulatedUser } from './User'

const DEFAULT_CONFIG_CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

export class CacheStore {
    store: DVCStorage
    logger: DVCLogger

    constructor(storage: DVCStorage, logger: DVCLogger) {
        this.store = storage
        this.logger = logger
    }

    /**
     * Hash user ID using SHA-256 algorithm via Web APIs
     * @param str String to hash
     * @returns Promise resolving to hashed string
     */
    async hashUserId(str: string): Promise<string> {
        // Use Web Crypto API for SHA-256 hashing
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate cache key for user configuration
     * Anonymous users share a single cache key since they have no unique identity
     * Identified users get unique cache keys based on their hashed user_id to prevent
     * different users from overwriting each other's cached configurations
     */
    private async getConfigKey(user: DVCPopulatedUser): Promise<string> {
        if (user.isAnonymous) {
            return StoreKey.AnonymousConfig
        } else {
            const hashedUserId = await this.hashUserId(user.user_id)
            return `${StoreKey.IdentifiedConfig}:${hashedUserId}`
        }
    }

    private async getConfigUserIdKey(user: DVCPopulatedUser): Promise<string> {
        const configKey = await this.getConfigKey(user)
        return `${configKey}.user_id`
    }

    private async getConfigFetchDateKey(user: DVCPopulatedUser): Promise<string> {
        const configKey = await this.getConfigKey(user)
        return `${configKey}.fetch_date`
    }

    private async loadConfigUserId(
        user: DVCPopulatedUser,
    ): Promise<string | undefined> {
        const userIdKey = await this.getConfigUserIdKey(user)
        return await this.store.load<string>(userIdKey)
    }

    private async loadConfigFetchDate(user: DVCPopulatedUser): Promise<number> {
        const fetchDateKey = await this.getConfigFetchDateKey(user)
        const fetchDate = (await this.store.load<string>(fetchDateKey)) || '0'
        return parseInt(fetchDate, 10)
    }

    async saveConfig(
        data: BucketedUserConfig,
        user: DVCPopulatedUser,
        dateFetched: number,
    ): Promise<void> {
        const configKey = await this.getConfigKey(user)
        const fetchDateKey = await this.getConfigFetchDateKey(user)
        const userIdKey = await this.getConfigUserIdKey(user)
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
