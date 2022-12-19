import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCStorage, StoreKey } from './types'
import { DVCPopulatedUser } from './User'

export class CacheStore {
    store: DVCStorage
    logger: DVCLogger

    constructor(storage: DVCStorage, logger: DVCLogger) {
        this.store = storage
        this.logger = logger
    }

    private getConfigKey(user: DVCPopulatedUser) {
        return user.isAnonymous ? StoreKey.AnonymousConfig : StoreKey.IdentifiedConfig
    }

    private getConfigUserIdKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.user_id`
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return `${this.getConfigKey(user)}.fetch_date`
    }

    private async loadConfigUserId(user: DVCPopulatedUser): Promise<string | undefined> {
        const userIdKey = this.getConfigUserIdKey(user)
        return this.store.load<string>(userIdKey)
    }

    private async loadConfigFetchDate(user: DVCPopulatedUser): Promise<number> {
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const fetchDate = await this.store.load<string>(fetchDateKey) || '0'
        return parseInt(fetchDate, 10)
    }

    saveConfig(data: BucketedUserConfig, user: DVCPopulatedUser, dateFetched: number): void {
        const configKey = this.getConfigKey(user)
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const userIdKey = this.getConfigUserIdKey(user)
        this.store.save(configKey, data)
        this.store.save(fetchDateKey, dateFetched)
        this.store.save(userIdKey, user.user_id)
        this.logger?.info('Successfully saved config to local storage')
    }

    async loadConfig(user: DVCPopulatedUser, configCacheTTL= 604800000): Promise<BucketedUserConfig | null> {
        const userId = await this.loadConfigUserId(user)
        if (user.user_id !== userId) {
            this.logger?.debug(`Skipping cached config: no config for user ID ${user.user_id}`)
            return null
        }

        const cachedFetchDate = await this.loadConfigFetchDate(user)
        const isConfigCacheTTLExpired = Date.now() - cachedFetchDate > configCacheTTL
        if (isConfigCacheTTLExpired) {
            this.logger?.debug('Skipping cached config: last fetched date is too old')
            return null
        }

        const configKey = await this.getConfigKey(user)
        const config = await this.store.load<BucketedUserConfig>(configKey)
        if (config === null || config === undefined) {
            this.logger?.debug('Skipping cached config: no config found')
            return null
        }

        return config
    }

    saveUser(user: DVCPopulatedUser): void {
        if (!user) {
            throw new Error('No user to save')
        }
        this.store.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    async loadUser(): Promise<DVCPopulatedUser | undefined> {
        return this.store.load<DVCPopulatedUser>(StoreKey.User)
    }

    saveAnonUserId(userId: string): void {
        this.store.save(StoreKey.AnonUserId, userId)
        this.logger?.info('Successfully saved anonymous user id to local storage')
    }

    async loadAnonUserId(): Promise<string | undefined> {
        return await this.store.load<string>(StoreKey.AnonUserId)
    }

    removeAnonUserId(): void {
        this.store.remove(StoreKey.AnonUserId)
    }
}

export default CacheStore
