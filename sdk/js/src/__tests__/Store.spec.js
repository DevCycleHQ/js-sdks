import Store, { StoreKey } from '../Store'

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
        await store.saveConfig(config)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.Config, JSON.stringify(config))
    })

    it('should load config from local storage', async () => {
        const store = new Store(localStorage)
        await store.loadConfig()
        expect(localStorage.getItem).toBeCalledWith(StoreKey.Config)
    })

    it('should save user to local storage', async () => {
        const store = new Store(localStorage)
        const user = { user_id: 'user1' }
        await store.saveUser(user)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.User, JSON.stringify(user))
    })

    it('should load user from local storage', async () => {
        const store = new Store(localStorage)
        await store.loadUser()
        expect(localStorage.getItem).toBeCalledWith(StoreKey.User)
    })

    it('should save anon user to local storage', async () => {
        const store = new Store(localStorage)
        const user = { isAnonymous: true }
        await store.saveUser(user)
        expect(localStorage.setItem).toBeCalledTimes(2)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.User, JSON.stringify(user))
        expect(localStorage.setItem).toBeCalledWith(StoreKey.AnonUser, JSON.stringify(user))
    })

    it('should load anon user from local storage', async () => {
        const store = new Store(localStorage)
        await store.loadAnonUser()
        expect(localStorage.getItem).toBeCalledWith(StoreKey.AnonUser)
    })
})
