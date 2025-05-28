import Store from '../src/CacheStore'
import { StoreKey } from '../src/types'
import { DVCPopulatedUser } from '../src/User'

describe('Store tests', () => {
    const localStorage = {
        load: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    }

    beforeEach(() => {
        localStorage.load.mockReset()
        localStorage.save.mockReset()
        localStorage.remove.mockReset()
    })

    it('should save config to local storage', async () => {
        jest.useFakeTimers()
        const store = new Store(localStorage)
        const config = {}
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        store.saveConfig(config, user, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user`,
            config,
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user.fetch_date`,
            Date.now(),
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user.user_id`,
            user.user_id,
        )
    })

    it('should load config from local storage if user id and config date are validated', async () => {
        const store = new Store(localStorage)
        localStorage.load.mockReturnValue('test_user')
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        await store.loadConfig(user, 2592000000)
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user.user_id`,
        )
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user.fetch_date`,
        )
        expect(localStorage.load).toBeCalledWith(`${StoreKey.IdentifiedConfig}:test_user`)
    })

    it('should save user to local storage', async () => {
        const store = new Store(localStorage)
        const user = { user_id: 'user1' }
        store.saveUser(user)
        expect(localStorage.save).toBeCalledWith(StoreKey.User, user)
    })

    it('should load user from local storage', async () => {
        const store = new Store(localStorage)
        store.loadUser()
        expect(localStorage.load).toBeCalledWith(StoreKey.User)
    })

    it('should use different cache keys for different identified users', async () => {
        const store = new Store(localStorage)
        const config = {}
        const user1 = new DVCPopulatedUser({ user_id: 'user1' })
        const user2 = new DVCPopulatedUser({ user_id: 'user2' })
        
        // Save config for user1
        store.saveConfig(config, user1, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:user1`,
            config,
        )
        
        // Save config for user2
        store.saveConfig(config, user2, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:user2`,
            config,
        )
    })

    it('should use anonymous cache key for anonymous users regardless of user_id', async () => {
        const store = new Store(localStorage)
        const config = {}
        const anonymousUser1 = new DVCPopulatedUser({ user_id: 'anon1', isAnonymous: true })
        const anonymousUser2 = new DVCPopulatedUser({ user_id: 'anon2', isAnonymous: true })
        
        // Both anonymous users should use the same cache key
        store.saveConfig(config, anonymousUser1, Date.now())
        expect(localStorage.save).toBeCalledWith(
            StoreKey.AnonymousConfig,
            config,
        )
        
        store.saveConfig(config, anonymousUser2, Date.now())
        expect(localStorage.save).toBeCalledWith(
            StoreKey.AnonymousConfig,
            config,
        )
    })
})
