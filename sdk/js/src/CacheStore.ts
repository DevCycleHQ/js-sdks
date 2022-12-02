import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './User'

export const StoreKey = {
    Config: 'dvc:config',
    User: 'dvc:user',
    AnonUserId: 'dvc:anonymous_user_id'
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

    remove(storeKey: string): void {
        this.store?.removeItem(storeKey)
    }

    saveConfig(data: BucketedUserConfig): void {
        this.save(StoreKey.Config, data)
        this.logger?.info('Successfully saved config to local storage')
    }

    loadConfig(): BucketedUserConfig | null | undefined {
        const config = this.load(StoreKey.Config)
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
