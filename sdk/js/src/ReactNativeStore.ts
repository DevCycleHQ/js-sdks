import { DVCLogger } from '@devcycle/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CacheStore } from './CacheStore'

export class ReactNativeStore extends CacheStore {
    override store: typeof AsyncStorage

    constructor(logger: DVCLogger) {
        super(AsyncStorage, logger)
        this.store = AsyncStorage

    }

    override load(storeKey: string): any {
        let storedValue
        (async () => {
            try {
                storedValue = await this.store.getItem(storeKey)
            } catch (e) {
                storedValue = null
            }
            return storedValue
        })()
    }
}

export default ReactNativeStore
