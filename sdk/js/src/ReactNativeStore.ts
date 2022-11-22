import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import { DVCPopulatedUser } from './User'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StoreKey } from './Store'

export class ReactNativeStore {
    store: typeof AsyncStorage
    logger?: DVCLogger

    constructor(logger: DVCLogger) {
        this.store = AsyncStorage
        this.logger = logger
    }

    save(storeKey: string, data: unknown): void {
        console.log(`storing ${JSON.stringify(data)} for ${storeKey}`)
        this.store.setItem(storeKey, JSON.stringify(data))
    }

    load(storeKey: string): any {
        let storedValue
        (async () => {
            try{
                storedValue = await this.store.getItem(storeKey)
                console.log(`trying, ${storeKey} returning ${storedValue}`)
            }
            catch(e){
                console.log(`failed RIP, ${storeKey} returning null`)
                storedValue = null
            }
            console.log(`here, ${storeKey} returning ${storedValue}`)
            return storedValue
        })()
    }

    remove(storeKey: string): void {
        this.store.removeItem(storeKey)
    }

    saveConfig(data: BucketedUserConfig): void {
        this.save(StoreKey.Config, data)
        this.logger?.info('Successfully saved config to local storage')
    }

    loadConfig(): string | null | undefined {
        return this.load(StoreKey.Config)
    }

    saveUser(user: DVCPopulatedUser): void {
        if (!user) {
            throw new Error('No user to save')
        }
        this.save(StoreKey.User, user)
        this.logger?.info('Successfully saved user to local storage')
    }

    loadUser(): string | null | undefined {
        return this.load(StoreKey.User)
    }
}

export default ReactNativeStore
