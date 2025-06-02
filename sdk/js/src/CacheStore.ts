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

    private getConfigKey(user: DVCPopulatedUser) {
        // For anonymous users, use the anonymous config key with user ID
        if (user.isAnonymous) {
            return `${StoreKey.AnonymousConfig}.${user.user_id}`
        }
        // For identified users, use the user config key with user ID
        return `${StoreKey.UserConfig}.${user.user_id}`
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.fetch_date`
    }

    private async loadLegacyConfigFetchDate(legacyKey: string): Promise<number> {
        const fetchDateKey = `${legacyKey}.fetch_date`
        const fetchDate = (await this.store.load<string>(fetchDateKey)) || '0'
        return parseInt(fetchDate, 10)
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
        await Promise.all([
            this.store.save(configKey, data),
            this.store.save(fetchDateKey, dateFetched),
        ])
        this.logger?.info(`Successfully saved config for user ${user.user_id} to local storage`)
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

    private async loadAndMigrateLegacyConfig(
        user: DVCPopulatedUser,
        configCacheTTL: number,
    ): Promise<BucketedUserConfig | null> {
        // For backward compatibility, try to load using the old format
        const legacyKey = user.isAnonymous
            ? StoreKey.AnonymousConfig
            : StoreKey.IdentifiedConfig
        
        const legacyConfig = await this.store.load<unknown>(legacyKey)
        if (legacyConfig === null || legacyConfig === undefined) {
            this.logger?.debug('Skipping cached config: no config found')
            return null
        }

        if (!this.isBucketedUserConfig(legacyConfig)) {
            this.logger?.debug(
                `Skipping cached config: invalid legacy config found: ${JSON.stringify(
                    legacyConfig,
                )}`,
            )
            return null
        }

        // Check if this legacy config is for the current user
        const userIdKey = `${legacyKey}.user_id`
        const userId = await this.store.load<string>(userIdKey)
        if (user.user_id !== userId) {
            this.logger?.debug(
                `Skipping cached config: legacy config is for different user ID ${userId} not ${user.user_id}`,
            )
            return null
        }

        // Check if the legacy config is expired
        const legacyFetchDateKey = `${legacyKey}.fetch_date`
        const legacyFetchDate = await this.loadLegacyConfigFetchDate(legacyKey)
        const isLegacyConfigCacheTTLExpired = 
            Date.now() - legacyFetchDate > configCacheTTL
        
        if (isLegacyConfigCacheTTLExpired) {
            this.logger?.debug(
                'Skipping cached legacy config: last fetched date is too old',
            )
            return null
        }

        // Migrate legacy config to the new format
        this.logger?.debug(
            `Migrating legacy config for user ${user.user_id} to new format`,
        )
        await this.saveConfig(legacyConfig, user, legacyFetchDate)

        return legacyConfig
    }

    async loadConfig(
        user: DVCPopulatedUser,
        configCacheTTL = DEFAULT_CONFIG_CACHE_TTL,
    ): Promise<BucketedUserConfig | null> {
        // Try to load config using the new user-specific key format
        const configKey = this.getConfigKey(user)
        const config = await this.store.load<unknown>(configKey)
        
        if (config !== null && config !== undefined) {
            // Check if config is valid
            if (!this.isBucketedUserConfig(config)) {
                this.logger?.debug(
                    `Skipping cached config: invalid config found: ${JSON.stringify(
                        config,
                    )}`,
                )
                return null
            }

            // Check if the config is expired
            const fetchDateKey = this.getConfigFetchDateKey(user)
            const fetchDate = await this.loadConfigFetchDate(user)
            const isConfigCacheTTLExpired = Date.now() - fetchDate > configCacheTTL
            
            if (isConfigCacheTTLExpired) {
                this.logger?.debug(
                    'Skipping cached config: last fetched date is too old',
                )
                return null
            }

            return config
        }

        return await this.loadAndMigrateLegacyConfig(user, configCacheTTL)
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
