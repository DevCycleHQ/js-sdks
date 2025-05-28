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
     * Generate cache key for user configuration
     * Anonymous users share a single cache key since they have no unique identity
     * Identified users get unique cache keys based on their user_id to prevent
     * different users from overwriting each other's cached configurations
     */
    private getConfigKey(user: DVCPopulatedUser) {
        if (user.isAnonymous) {
            return StoreKey.AnonymousConfig
        } else {
            return `${StoreKey.IdentifiedConfig}:${user.user_id}`
        }
    }
    
    /**
     * Get the legacy config key that was used before per-user caching
     * This is used for migrating existing configs to the new format
     */
    private getLegacyConfigKey() {
        return StoreKey.IdentifiedConfig
    }

    private getConfigUserIdKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.user_id`
    }

    private getLegacyConfigUserIdKey() {
        return `${this.getLegacyConfigKey()}.user_id`
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.fetch_date`
    }
    
    private getLegacyConfigFetchDateKey() {
        return `${this.getLegacyConfigKey()}.fetch_date`
    }
    
    /**
     * Checks if there's a configuration stored with the legacy format and migrates it
     * to the new per-user format if the user ID matches
     */
    private async migrateFromLegacy(user: DVCPopulatedUser): Promise<boolean> {
        if (user.isAnonymous) {
            // Anonymous user configs didn't change format
            return false
        }
        
        // Check if there's a legacy config and if the user_id matches
        const legacyUserId = await this.store.load<string>(this.getLegacyConfigUserIdKey())
        
        if (!legacyUserId || legacyUserId !== user.user_id) {
            // No legacy config or user_id doesn't match
            return false
        }
        
        // Load the legacy config data
        const legacyConfig = await this.store.load<unknown>(this.getLegacyConfigKey())
        const legacyFetchDate = await this.store.load<string>(this.getLegacyConfigFetchDateKey())
        
        if (!legacyConfig || !legacyFetchDate) {
            return false
        }
        
        if (!this.isBucketedUserConfig(legacyConfig)) {
            this.logger?.debug(
                `Skipping legacy config migration: invalid config found: ${JSON.stringify(
                    legacyConfig,
                )}`,
            )
            return false
        }
        
        try {
            // Save to new format
            const configKey = this.getConfigKey(user)
            const fetchDateKey = this.getConfigFetchDateKey(user)
            const userIdKey = this.getConfigUserIdKey(user)
            
            await Promise.all([
                this.store.save(configKey, legacyConfig),
                this.store.save(fetchDateKey, legacyFetchDate),
                this.store.save(userIdKey, user.user_id),
            ])
            
            this.logger?.info(
                `Migrated legacy config for user ${user.user_id} to new format`,
            )
            return true
        } catch (e) {
            this.logger?.error('Error migrating legacy config', e)
            return false
        }
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
        // Check for userId match in current key format
        const userId = await this.loadConfigUserId(user)
        
        if (user.user_id !== userId) {
            // User ID doesn't match current format, check for legacy config
            if (!user.isAnonymous) {
                // Try to migrate from legacy format
                const migrated = await this.migrateFromLegacy(user)
                if (migrated) {
                    // If migration succeeded, proceed with normal loading
                    return this.loadConfig(user, configCacheTTL)
                }
            }
            
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

        const configKey = this.getConfigKey(user)
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
