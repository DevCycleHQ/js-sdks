import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCCacheStore, StoreKey } from './types'
import { DVCPopulatedUser } from './User'

export class CacheStore implements DVCCacheStore {
    store?: Storage
    logger?: DVCLogger

    constructor(localStorage?: Storage, logger?: DVCLogger) {
        this.store = localStorage
        this.logger = logger
    }

    save(storeKey: string, data: unknown): void {
        this.store?.setItem(storeKey, JSON.stringify(data))
    }

    load<T>(storeKey: string): Promise<T | null | undefined> {
        return new Promise((resolve) => {
            const item = this.store?.getItem(storeKey)
            resolve(item ? JSON.parse(item) : null)
        })
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

    private async loadConfigUserId(user: DVCPopulatedUser): Promise<string | null | undefined> {
        const userIdKey = this.getConfigUserIdKey(user)
        return this.load<string>(userIdKey)
    }

    private async loadConfigFetchDate(user: DVCPopulatedUser): Promise<number> {
        const fetchDateKey = this.getConfigFetchDateKey(user)
        return parseInt(await this.load<string>(fetchDateKey) || '0', 10)
    }

    remove(storeKey: string): void {
        this.store?.removeItem(storeKey)
    }

    saveConfig(data: BucketedUserConfig, user: DVCPopulatedUser, dateFetched: number): void {
        const configKey = this.getConfigKey(user)
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const userIdKey = this.getConfigUserIdKey(user)
        this.save(configKey, data)
        this.save(fetchDateKey, dateFetched)
        this.save(userIdKey, user.user_id)
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
        const config = await this.load<BucketedUserConfig>(configKey)
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
        this.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    async loadUser(): Promise<DVCPopulatedUser | null | undefined> {
        return this.load<DVCPopulatedUser>(StoreKey.User)
    }

    saveAnonUserId(userId: string): void {
        this.save(StoreKey.AnonUserId, userId)
        this.logger?.info('Successfully saved anonymous user id to local storage')
    }

    async loadAnonUserId(): Promise<string | null | undefined> {
        return await this.load<string>(StoreKey.AnonUserId)
    }
}

export default CacheStore
