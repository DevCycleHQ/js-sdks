import Store, { StoreKey } from '../src/CacheStore'

describe('ReactNativeStore tests', () => {

    const rnStorage = {
        getItem: jest.fn(),
        setItem: jest.fn()
    }

    beforeEach(() => {
        rnStorage.getItem.mockReset()
        rnStorage.setItem.mockReset()
    })

    it('should save config to local storage', async () => {
        const store = new Store(rnStorage)
        const config = {}
        store.saveConfig(config)
        expect(rnStorage.setItem).toBeCalledWith(StoreKey.Config, JSON.stringify(config))
    })

    it('should load config from local storage', async () => {
        const store = new Store(rnStorage)
        store.loadConfig()
        expect(rnStorage.getItem).toBeCalledWith(StoreKey.Config)
    })

    it('should save user to local storage', async () => {
        const store = new Store(rnStorage)
        const user = { user_id: 'user1' }
        store.saveUser(user)
        expect(rnStorage.setItem).toBeCalledWith(StoreKey.User, JSON.stringify(user))
    })

    it('should load user from local storage', async () => {
        const store = new Store(rnStorage)
        store.loadUser()
        expect(rnStorage.getItem).toBeCalledWith(StoreKey.User)
    })

})
