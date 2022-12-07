import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './User'

export const StoreKey = {
    User: 'dvc:user',
    AnonUserId: 'dvc:anonymous_user_id',
    AnonymousConfig: 'dvc:anonymous_config',
    IdentifiedConfig: 'dvc:identified_config',
}

export abstract class CacheStore {
    store?: Storage
    logger?: DVCLogger

    constructor(localStorage?: Storage, logger?: DVCLogger) {
        this.store = localStorage
        this.logger = logger
    }

    private save(storeKey: string, data: unknown): void {
        this.store?.setItem(storeKey, JSON.stringify(data))
    }

    protected load(storeKey: string): any | null | undefined {
        const item = this.store?.getItem(storeKey)
        return item ? JSON.parse(item) : null
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

    private loadConfigUserId(user: DVCPopulatedUser): string | null | undefined {
        const userIdKey = this.getConfigUserIdKey(user)
        return this.load(userIdKey)
    }

    private loadConfigFetchDate(user: DVCPopulatedUser): string | null | undefined {
        const fetchDateKey = this.getConfigFetchDateKey(user)
        return this.load(fetchDateKey)
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

    loadConfig(user: DVCPopulatedUser, configCacheTTL= 604800000): BucketedUserConfig | null | undefined {
        const userId = this.loadConfigUserId(user)
        const cachedFetchDate = parseInt(this.loadConfigFetchDate(user) || '0')
        const isConfigCacheTTLExpired = Date.now() - cachedFetchDate > configCacheTTL

        if (user.user_id === userId && !isConfigCacheTTLExpired) {
            const configKey = this.getConfigKey(user)
            return this.load(configKey)
        }
        return null
    }

    saveUser(user: DVCPopulatedUser): void {
        if (!user) {
            throw new Error('No user to save')
        }
        this.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    loadUser(): DVCPopulatedUser | null | undefined {
        return this.load(StoreKey.User)
    }

    saveAnonUserId(userId: string): void {
        this.save(StoreKey.AnonUserId, userId)
        this.logger?.info('Successfully saved anonymous user id to local storage')
    }

    loadAnonUserId(): string | null | undefined {
        return this.load(StoreKey.AnonUserId)
    }
}

export default CacheStore
