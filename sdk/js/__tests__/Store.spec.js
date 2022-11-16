import Store, { StoreKey } from '../src/Store'

describe('Store tests', () => {

    const localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn()
    }

    beforeEach(() => {
        localStorage.getItem.mockReset()
        localStorage.setItem.mockReset()
    })

    it('should save config to local storage', async () => {
        const store = new Store(localStorage)
        const config = {}
        store.saveConfig(config)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.Config, JSON.stringify(config))
    })

    it('should load config from local storage', async () => {
        const store = new Store(localStorage)
        store.loadConfig()
        expect(localStorage.getItem).toBeCalledWith(StoreKey.Config)
    })

    it('should save user to local storage', async () => {
        const store = new Store(localStorage)
        const user = { user_id: 'user1' }
        store.saveUser(user)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.User, JSON.stringify(user))
    })

    it('should load user from local storage', async () => {
        const store = new Store(localStorage)
        store.loadUser()
        expect(localStorage.getItem).toBeCalledWith(StoreKey.User)
    })

})
