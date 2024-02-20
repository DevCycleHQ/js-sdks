export class DefaultCacheStore {
    private store?: Storage

    constructor() {
        this.store =
            typeof window !== 'undefined'
                ? window.localStorage
                : stubbedLocalStorage
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

    remove(storeKey: string): void {
        this.store?.removeItem(storeKey)
    }

    // Initialize IndexedDB
    async initIndexedDB(): Promise<void> {
        const dbName = 'myDatabase';
        const storeName = 'myStore';

        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };

        this.db = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // IndexedDB save
    async indexedDBSave(storeKey, data): Promise<void> {
        const tx = this.db.transaction('myStore', 'readwrite');
        const store = tx.objectStore('myStore');
        await store.put({ id: storeKey, data: data });
    }

    // IndexedDB load
    async indexedDBLoad(storeKey):  Promise<void> {
        const tx = this.db.transaction('myStore', 'readonly');
        const store = tx.objectStore('myStore');
        const request = store.get(storeKey);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = () => reject(request.error);
        });
    }

    // IndexedDB remove
    async indexedDBRemove(storeKey) {
        const tx = this.db.transaction('myStore', 'readwrite');
        const store = tx.objectStore('myStore');
        await store.delete(storeKey);
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

export default DefaultCacheStore
