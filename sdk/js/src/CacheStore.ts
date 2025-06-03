import type { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCStorage, StoreKey } from './types'
import { DVCPopulatedUser } from './User'

const DEFAULT_CONFIG_CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

export class CacheStore {
    store: DVCStorage
    logger: DVCLogger
    private configCacheTTL: number

    constructor(
        storage: DVCStorage,
        logger: DVCLogger,
        configCacheTTL = DEFAULT_CONFIG_CACHE_TTL,
    ) {
        this.store = storage
        this.logger = logger
        this.configCacheTTL = configCacheTTL
    }

    private getConfigKey(user: DVCPopulatedUser) {
        return user.isAnonymous
            ? `${StoreKey.AnonymousConfig}.${user.user_id}`
            : `${StoreKey.IdentifiedConfig}.${user.user_id}`
    }

    private getConfigExpiryKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.expiry_date`
    }

    private async loadConfigExpiryDate(
        user: DVCPopulatedUser,
    ): Promise<number> {
        const expiryKey = this.getConfigExpiryKey(user)
        const expiryDate = (await this.store.load<string>(expiryKey)) || '0'
        return parseInt(expiryDate, 10)
    }

    async saveConfig(
        data: BucketedUserConfig,
        user: DVCPopulatedUser,
    ): Promise<void> {
        const configKey = this.getConfigKey(user)
        const expiryKey = this.getConfigExpiryKey(user)
        const now = Date.now()
        const expiryDate = now + this.configCacheTTL
        await Promise.all([
            this.store.save(configKey, data),
            this.store.save(expiryKey, expiryDate),
        ])
        this.logger?.info(
            `Successfully saved config for user ${user.user_id} to local storage`,
        )
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
    ): Promise<BucketedUserConfig | null> {
        await this.migrateLegacyConfigs()

        // Run cleanup periodically to remove old expired configs
        await this.cleanupExpiredConfigs()

        // Load config using the new user-specific key format
        const configKey = this.getConfigKey(user)
        const config = await this.store.load<unknown>(configKey)

        if (!config) {
            // No config found
            this.logger?.debug('Skipping cached config: no config found')
            return null
        }

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
        const expiryDate = await this.loadConfigExpiryDate(user)
        const isConfigExpired = Date.now() > expiryDate

        if (isConfigExpired) {
            this.logger?.debug('Skipping cached config: config has expired')
            // Remove expired config and expiry date from storage
            const expiryKey = this.getConfigExpiryKey(user)
            await Promise.all([
                this.store.remove(configKey),
                this.store.remove(expiryKey),
            ])
            return null
        }

        return config
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
        const anonUserId = await this.loadAnonUserId()
        if (anonUserId) {
            // Remove anonymous config data for this user
            const configKey = `${StoreKey.AnonymousConfig}.${anonUserId}`
            const expiryKey = `${configKey}.expiry_date`
            await Promise.all([
                this.store.remove(configKey),
                this.store.remove(expiryKey),
            ])
        }
        await this.store.remove(StoreKey.AnonUserId)
    }

    async migrateLegacyConfigs(): Promise<void> {
        // Migrate both anonymous and identified legacy configs
        await Promise.all([
            this.migrateLegacyConfigType(StoreKey.AnonymousConfig, true),
            this.migrateLegacyConfigType(StoreKey.IdentifiedConfig, false),
        ])
    }

    async migrateLegacyConfigType(
        legacyKey: string,
        isAnonymous: boolean,
    ): Promise<void> {
        try {
            const legacyConfig = await this.store.load<unknown>(legacyKey)
            if (!legacyConfig || !this.isBucketedUserConfig(legacyConfig)) {
                return
            }

            // Get the user ID from the legacy format
            const userIdKey = `${legacyKey}.user_id`
            const userId = await this.store.load<string>(userIdKey)
            if (!userId) {
                return
            }

            // Create a minimal user object for migration
            const user = new DVCPopulatedUser(
                { user_id: userId, isAnonymous },
                {},
            )

            // Check if new format already exists
            const fetchDateKey = `${legacyKey}.fetch_date`
            const newConfigKey = this.getConfigKey(user)
            const newConfig = await this.store.load<unknown>(newConfigKey)
            if (newConfig) {
                // New format already exists, clean up legacy
                await Promise.all([
                    this.store.remove(legacyKey),
                    this.store.remove(userIdKey),
                    this.store.remove(fetchDateKey),
                    this.store.remove(StoreKey.User),
                ])
                return
            }

            // Migrate to new format with expiry date
            this.logger?.debug(
                `Migrating legacy ${
                    isAnonymous ? 'anonymous' : 'identified'
                } config for user ${userId} to new format`,
            )
            await this.saveConfig(legacyConfig, user)

            // Clean up legacy storage including stored user
            await Promise.all([
                this.store.remove(legacyKey),
                this.store.remove(userIdKey),
                this.store.remove(fetchDateKey),
                this.store.remove(StoreKey.User),
            ])
        } catch (error) {
            this.logger?.debug(
                `Failed to migrate legacy config from ${legacyKey}: ${error}`,
            )
        }
    }

    /**
     * Clean up expired config entries from storage.
     * This removes configs for any user that have passed their expiry date.
     */
    async cleanupExpiredConfigs(): Promise<void> {
        if (!this.store.listKeys) {
            this.logger?.debug(
                'Storage does not support key enumeration, skipping cleanup',
            )
            return
        }

        try {
            const now = Date.now()
            const prefixes = [
                StoreKey.AnonymousConfig,
                StoreKey.IdentifiedConfig,
            ]

            for (const prefix of prefixes) {
                const keys = await this.store.listKeys(prefix)

                for (const key of keys) {
                    // Skip if this is an expiry key itself
                    if (key.endsWith('.expiry_date')) continue

                    const expiryKey = `${key}.expiry_date`
                    const expiryDate = await this.store.load<string>(expiryKey)

                    if (expiryDate) {
                        const expiry = parseInt(expiryDate, 10)
                        if (now > expiry) {
                            this.logger?.debug(
                                `Cleaning up expired config: ${key}`,
                            )
                            await Promise.all([
                                this.store.remove(key),
                                this.store.remove(expiryKey),
                            ])
                        }
                    } else {
                        // Config without expiry date (legacy or orphaned), remove it
                        this.logger?.debug(
                            `Cleaning up orphaned config: ${key}`,
                        )
                        await this.store.remove(key)
                    }
                }
            }
        } catch (error) {
            this.logger?.debug(`Failed to cleanup expired configs: ${error}`)
        }
    }
}

export default CacheStore
