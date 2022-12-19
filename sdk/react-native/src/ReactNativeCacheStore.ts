import AsyncStorage from '@react-native-async-storage/async-storage'
import { DVCStorage } from '@devcycle/devcycle-js-sdk'

export class ReactNativeStore implements DVCStorage {
    store: typeof AsyncStorage

    constructor() {
        this.store = AsyncStorage
    }

    save(storeKey: string, data: unknown): void {
        this.store.setItem(storeKey, JSON.stringify(data))
    }

    load<T>(storeKey: string): Promise<T | undefined> {
        return this.store.getItem(storeKey)
            .then((item) => {
                return (item ? JSON.parse(item) : undefined)
            })
    }

    remove(storeKey: string): void {
        this.store.removeItem(storeKey)
    }
}

export default ReactNativeStore