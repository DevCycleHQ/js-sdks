export class DefaultStorage {
    private store: Storage

    constructor() {
        this.store =
            typeof window !== 'undefined'
                ? window.localStorage
                : stubbedLocalStorage
    }

    save(storeKey: string, data: unknown): void {
        this.store.setItem(storeKey, JSON.stringify(data))
    }

    load<T>(storeKey: string): Promise<T | undefined> {
        return new Promise((resolve) => {
            const item = this.store.getItem(storeKey)
            resolve(item ? JSON.parse(item) : undefined)
        })
    }

    remove(storeKey: string): void {
        this.store.removeItem(storeKey)
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

export default DefaultStorage
