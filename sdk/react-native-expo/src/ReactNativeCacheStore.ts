import AsyncStorage from '@react-native-async-storage/async-storage'
import { DVCStorage } from '@devcycle/js-client-sdk'

export class ReactNativeStore implements DVCStorage {
    store: typeof AsyncStorage

    constructor() {
        this.store = AsyncStorage
    }

    async save(storeKey: string, data: unknown): Promise<void> {
        await this.store.setItem(storeKey, JSON.stringify(data))
    }

    async load<T>(storeKey: string): Promise<T | undefined> {
        const item = await this.store.getItem(storeKey)
        return item ? JSON.parse(item) : undefined
    }

    async remove(storeKey: string): Promise<void> {
        await this.store.removeItem(storeKey)
    }

    async listKeys(prefix: string): Promise<string[]> {
        const allKeys = await this.store.getAllKeys()
        return allKeys.filter((key) => key.startsWith(prefix))
    }
}

export default ReactNativeStore
