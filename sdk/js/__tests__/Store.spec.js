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
        jest.useFakeTimers().setSystemTime(new Date('2022-01-01'))
        const store = new Store(localStorage)
        const config = {}
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        store.saveConfig(config, user, Date.now())
        expect(localStorage.save).toBeCalledWith(
            StoreKey.IdentifiedConfig,
            config,
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}.fetch_date`,
            Date.now(),
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}.user_id`,
            user.user_id,
        )
    })

    it('should load config from local storage if user id and config date are validated', async () => {
        const store = new Store(localStorage)
        localStorage.load.mockReturnValue('test_user')
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        await store.loadConfig(user, 604800000)
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}.user_id`,
        )
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}.fetch_date`,
        )
        expect(localStorage.load).toBeCalledWith(StoreKey.IdentifiedConfig)
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
})
