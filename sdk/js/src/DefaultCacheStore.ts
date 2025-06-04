// Abstract Storage class
import { DVCStorage } from './types'
import { checkIsServiceWorker } from './utils'

export abstract class StorageStrategy implements DVCStorage {
    abstract store: unknown
    abstract init(): Promise<unknown>
    abstract save(storeKey: string, data: unknown): Promise<void>
    abstract load<T>(storeKey: string): Promise<T | undefined>
    abstract remove(storeKey: string): Promise<void>
    abstract listKeys(prefix: string): Promise<string[]>
}

// LocalStorage implementation
export class LocalStorageStrategy extends StorageStrategy {
    override store: Storage
    private isTesting: boolean

    constructor(isTesting = false) {
        super()
        this.isTesting = isTesting
        this.init()
    }

    async init(): Promise<void> {
        this.store = this.isTesting ? stubbedLocalStorage : window.localStorage
    }

    async save(storeKey: string, data: unknown): Promise<void> {
        this.store.setItem(storeKey, JSON.stringify(data))
    }

    async load<T>(storeKey: string): Promise<T | undefined> {
        const item = this.store.getItem(storeKey)
        return item ? JSON.parse(item) : undefined
    }

    async remove(storeKey: string): Promise<void> {
        this.store.removeItem(storeKey)
    }

    async listKeys(prefix: string): Promise<string[]> {
        const keys: string[] = []
        for (let i = 0; i < this.store.length; i++) {
            const key = this.store.key(i)
            if (key && key.startsWith(prefix)) {
                keys.push(key)
            }
        }
        return keys
    }
}

const stubbedLocalStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
}
// IndexedDB implementation
export class IndexedDBStrategy extends StorageStrategy {
    override store: IDBDatabase
    private isReady: boolean
    private connectionPromise: Promise<void>
    private static storeName = 'DevCycleStore'
    private static DBName = 'DevCycleDB'

    constructor() {
        super()
        this.connectionPromise = new Promise((resolve, reject) => {
            this.init()
                .then((db) => {
                    this.store = db
                    this.isReady = true
                    resolve()
                })
                .catch((err) => reject(err))
        })
    }

    async init(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(IndexedDBStrategy.DBName, 1)

            request.onupgradeneeded = (event) => {
                const db = request.result
                if (
                    !db.objectStoreNames.contains(IndexedDBStrategy.storeName)
                ) {
                    db.createObjectStore(IndexedDBStrategy.storeName, {
                        keyPath: 'id',
                    })
                }
            }

            request.onsuccess = (event) => {
                resolve(request.result)
            }

            request.onerror = (event) => {
                reject(request.error)
            }
        })
    }

    async save(storeKey: string, data: unknown): Promise<void> {
        await this.connectionPromise
        const tx = this.store.transaction(
            IndexedDBStrategy.storeName,
            'readwrite',
        )
        const store = tx.objectStore(IndexedDBStrategy.storeName)
        store.put({ id: storeKey, data: data })
    }
    // IndexedDB load
    async load<T>(storeKey: string): Promise<T | undefined> {
        await this.connectionPromise
        const tx = this.store.transaction(
            IndexedDBStrategy.storeName,
            'readonly',
        )
        const store = tx.objectStore(IndexedDBStrategy.storeName)
        const request = store.get(storeKey)
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result ? request.result.data : undefined)
            }
            request.onerror = () => reject(request.error)
        })
    }

    // IndexedDB remove
    async remove(storeKey: string): Promise<void> {
        await this.connectionPromise
        const tx = this.store.transaction(
            IndexedDBStrategy.storeName,
            'readwrite',
        )
        const store = tx.objectStore(IndexedDBStrategy.storeName)
        store.delete(storeKey)
    }

    async listKeys(prefix: string): Promise<string[]> {
        const keys: string[] = []
        await this.connectionPromise
        const tx = this.store.transaction(
            IndexedDBStrategy.storeName,
            'readonly',
        )
        const store = tx.objectStore(IndexedDBStrategy.storeName)
        const request = store.openCursor()
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = (
                    event.target as IDBRequest<IDBCursorWithValue | null>
                ).result
                if (cursor) {
                    const key = cursor.key as string
                    if (key.startsWith(prefix)) {
                        keys.push(key)
                    }
                    cursor.continue()
                } else {
                    resolve(keys)
                }
            }
            request.onerror = () => reject(request.error)
        })
    }
}

export function getStorageStrategy(): StorageStrategy {
    if (checkIsServiceWorker()) {
        return new IndexedDBStrategy()
    } else {
        return new LocalStorageStrategy(typeof window === 'undefined')
    }
}
