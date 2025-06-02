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
        return user.isAnonymous
            ? `${StoreKey.AnonymousConfig}.${user.user_id}`
            : `${StoreKey.UserConfig}.${user.user_id}`
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.fetch_date`
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
        configCacheTTL = DEFAULT_CONFIG_CACHE_TTL,
    ): Promise<BucketedUserConfig | null> {
        await this.migrateLegacyConfigs()

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
        const fetchDate = await this.loadConfigFetchDate(user)
        const isConfigCacheTTLExpired = Date.now() - fetchDate > configCacheTTL

        if (isConfigCacheTTLExpired) {
            this.logger?.debug(
                'Skipping cached config: last fetched date is too old',
            )
            // Remove expired config and fetch date from storage
            const fetchDateKey = this.getConfigFetchDateKey(user)
            await Promise.all([
                this.store.remove(configKey),
                this.store.remove(fetchDateKey),
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

            // Get the fetch date
            const fetchDateKey = `${legacyKey}.fetch_date`
            const fetchDate =
                (await this.store.load<string>(fetchDateKey)) || '0'
            const legacyFetchDate = parseInt(fetchDate, 10)

            // Create a minimal user object for migration
            const user = new DVCPopulatedUser(
                { user_id: userId, isAnonymous },
                {},
            )

            // Check if new format already exists
            const newConfigKey = this.getConfigKey(user)
            const newConfig = await this.store.load<unknown>(newConfigKey)
            if (newConfig) {
                // New format already exists, clean up legacy
                await Promise.all([
                    this.store.remove(legacyKey),
                    this.store.remove(userIdKey),
                    this.store.remove(fetchDateKey),
                ])
                return
            }

            // Migrate to new format
            this.logger?.debug(
                `Migrating legacy ${
                    isAnonymous ? 'anonymous' : 'identified'
                } config for user ${userId} to new format`,
            )
            await this.saveConfig(legacyConfig, user, legacyFetchDate)

            // Clean up legacy storage
            await Promise.all([
                this.store.remove(legacyKey),
                this.store.remove(userIdKey),
                this.store.remove(`${legacyKey}.fetch_date`),
            ])
        } catch (error) {
            this.logger?.debug(
                `Failed to migrate legacy config from ${legacyKey}: ${error}`,
            )
        }
    }
}

export default CacheStore
