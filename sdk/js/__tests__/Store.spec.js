import Store, { StoreKey } from '../src/CacheStore'
import { DVCPopulatedUser } from '../src/User'

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
        jest.useFakeTimers().setSystemTime(new Date('2022-01-01'))
        const store = new Store(localStorage)
        const config = {}
        const user = new DVCPopulatedUser({ user_id: "test_user" })
        store.saveConfig(config, user)
        expect(localStorage.setItem).toBeCalledWith(StoreKey.IdentifiedConfig, JSON.stringify(config))
        expect(localStorage.setItem).toBeCalledWith(StoreKey.IdentifiedConfigDate, JSON.stringify(Date.now()))
        expect(localStorage.setItem).toBeCalledWith(StoreKey.IdentifiedConfigUserId, JSON.stringify(user.user_id))
    })

    it('should load config from local storage if user id and config date are validated', async () => {
        const store = new Store(localStorage)
        localStorage.getItem.mockReturnValue(JSON.stringify("test_user"))
        const user = new DVCPopulatedUser({ user_id: "test_user" })
        store.loadConfig(user, 604800000)
        expect(localStorage.getItem).toBeCalledWith(StoreKey.IdentifiedConfigUserId)
        expect(localStorage.getItem).toBeCalledWith(StoreKey.IdentifiedConfigDate)
        expect(localStorage.getItem).toBeCalledWith(StoreKey.IdentifiedConfig)
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
