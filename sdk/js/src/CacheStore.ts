import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './User'

export const StoreKey = {
    Config: 'dvc:config',
    User: 'dvc:user',
    AnonUserId: 'dvc:anonymous_user_id',
    AnonymousConfig: 'dvc:anonymous_config',
    AnonymousConfigUserId: 'dvc:anonymous_config.user_id',
    AnonymousConfigDate: 'dvc:anonymous_config.fetch_date',
    IdentifiedConfig: 'dvc:identified_config',
    IdentifiedConfigUserId: 'dvc:identified_config.user_id',
    IdentifiedConfigDate: 'dvc:identified_config.fetch_date'
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

    protected load(storeKey: string): string | null | undefined {
        return this.store?.getItem(storeKey)
    }

    private getConfigStoreKey(user: DVCPopulatedUser) {
        return user.isAnonymous ? StoreKey.AnonymousConfig : StoreKey.IdentifiedConfig
    }

    private getUserIdStoreKey(user: DVCPopulatedUser) {
        return user.isAnonymous ? StoreKey.AnonUserId : StoreKey.IdentifiedConfigUserId
    }

    private getConfigFetchDateKey(user: DVCPopulatedUser) {
        return user.isAnonymous ? StoreKey.AnonymousConfigDate : StoreKey.IdentifiedConfigDate
    }

    private loadConfigUserId(user: DVCPopulatedUser): string | null | undefined {
        const userIdKey = this.getUserIdStoreKey(user)
        const userId = this.load(userIdKey)
        return userId ? JSON.parse(userId) : userId
    }

    private loadConfigFetchDate(user: DVCPopulatedUser): string | null | undefined {
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const fetchDate = this.load(fetchDateKey)
        return fetchDate ? JSON.parse(fetchDate) : fetchDate
    }

    remove(storeKey: string): void {
        this.store?.removeItem(storeKey)
    }

    saveConfig(data: BucketedUserConfig, user: DVCPopulatedUser): void {
        const configKey = this.getConfigStoreKey(user)
        const fetchDateKey = this.getConfigFetchDateKey(user)
        const userIdKey = this.getUserIdStoreKey(user)
        this.save(configKey, data)
        this.save(fetchDateKey, Date.now())
        this.save(userIdKey, user.user_id)
        this.logger?.info('Successfully saved config to local storage')
    }

    loadConfig(user: DVCPopulatedUser, configCacheTTL: number): BucketedUserConfig | null | undefined {
        const userId = this.loadConfigUserId(user)
        const cachedFetchDate = parseInt(this.loadConfigFetchDate(user) || "")
        const configKey = this.getConfigStoreKey(user)
        const isConfigCacheTTLExpired = (Date.now() - cachedFetchDate) > configCacheTTL
        let config
        if (user.user_id === userId  && !isConfigCacheTTLExpired) {
            config = this.load(configKey)
        }
        return config ? JSON.parse(config) : config
    }

    saveUser(user: DVCPopulatedUser): void {
        if (!user) {
            throw new Error('No user to save')
        }
        this.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    loadUser(): DVCPopulatedUser | null | undefined {
        const user = this.load(StoreKey.User)
        return user ? JSON.parse(user) : user
    }

    saveAnonUserId(userId: string): void {
        this.save(StoreKey.AnonUserId, userId)
        this.logger?.info('Successfully saved anonymous user id to local storage')
    }

    loadAnonUserId(): string | null | undefined {
        const anonUserId = this.load(StoreKey.AnonUserId)
        return anonUserId ? JSON.parse(anonUserId) : anonUserId
    }
}

export default CacheStore
