import { DVCUser } from './types'
import { BucketedUserConfig } from '@devcycle/shared/ts-types'

export const StoreKey = {
    Config: 'dvc:config',
    User: 'dvc:user',
    AnonUser: 'dvc:anonymous_user'
}

export class Store {
    store?: Storage

    constructor(localStorage: Storage) {
        this.store = localStorage
    }

    save(storeKey: string, data: unknown): Promise<void> {
        return this.modifyStore((storeKey: string) => {
            this.store?.setItem(storeKey, JSON.stringify(data))
        }, storeKey)
    }

    load(storeKey: string): Promise<string | null | undefined> {
        return new Promise((resolve) => {
            resolve(this.store?.getItem(storeKey))
        })
    }

    clear(storeKey: string): Promise<void> {
        return this.modifyStore((storeKey: string) => this.store?.removeItem(storeKey), storeKey)
    }

    modifyStore(modify: (storeKey: string) => void, storeKey: string): Promise<void> {
        try {
            return new Promise((resolve) => {
                resolve(modify(storeKey))
            })
        } catch (e) {
            console.log(e)
            return Promise.resolve()
        }
    }

    saveConfig(data: BucketedUserConfig) {
        return this.save(StoreKey.Config, data)
    }

    loadConfig() {
        return this.load(StoreKey.Config)
    }

    saveUser(user: DVCUser) {
        if (!user) {
            return Promise.reject('No user to save')
        }
        const saveUserPromise = this.save(StoreKey.User, user)
        if (user.isAnonymous) {
            saveUserPromise.then(() => this.save(StoreKey.AnonUser, user))
        }
        return saveUserPromise
    }

    loadUser() {
        return this.load(StoreKey.User)
    }

    loadAnonUser() {
        return this.load(StoreKey.AnonUser)
    }
}

export default Store
