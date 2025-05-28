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
        const hashedUserId = store.hashUserId('test_user')
        await store.saveConfig(config, user, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId}`,
            config,
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId}.fetch_date`,
            Date.now(),
        )
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId}.user_id`,
            user.user_id,
        )
    })

    it('should load config from local storage if user id and config date are validated', async () => {
        const store = new Store(localStorage)
        localStorage.load.mockReturnValue('test_user')
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        const hashedUserId = store.hashUserId('test_user')
        await store.loadConfig(user, 2592000000)
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId}.user_id`,
        )
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId}.fetch_date`,
        )
        expect(localStorage.load).toBeCalledWith(`${StoreKey.IdentifiedConfig}:${hashedUserId}`)
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
        const hashedUserId1 = store.hashUserId('user1')
        const hashedUserId2 = store.hashUserId('user2')
        
        // Save config for user1
        await store.saveConfig(config, user1, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId1}`,
            config,
        )
        
        // Save config for user2
        await store.saveConfig(config, user2, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:${hashedUserId2}`,
            config,
        )
    })

    it('should use anonymous cache key for anonymous users regardless of user_id', async () => {
        const store = new Store(localStorage)
        const config = {}
        const anonymousUser1 = new DVCPopulatedUser({ user_id: 'anon1', isAnonymous: true })
        const anonymousUser2 = new DVCPopulatedUser({ user_id: 'anon2', isAnonymous: true })
        
        // Both anonymous users should use the same cache key
        await store.saveConfig(config, anonymousUser1, Date.now())
        expect(localStorage.save).toBeCalledWith(
            StoreKey.AnonymousConfig,
            config,
        )
        
        await store.saveConfig(config, anonymousUser2, Date.now())
        expect(localStorage.save).toBeCalledWith(
            StoreKey.AnonymousConfig,
            config,
        )
    })

    it('should use default TTL of 30 days when no TTL is provided', async () => {
        const store = new Store(localStorage)
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        
        // Mock the current time
        const now = Date.now()
        jest.spyOn(Date, 'now').mockReturnValue(now)
        
        // Mock cached data that is 29 days old (should be valid)
        const twentyNineDaysAgo = now - (29 * 24 * 60 * 60 * 1000)
        localStorage.load
            .mockReturnValueOnce('test_user') // user_id
            .mockReturnValueOnce(twentyNineDaysAgo.toString()) // fetch_date
            .mockReturnValueOnce({ features: {}, variables: {}, project: {}, environment: {}, featureVariationMap: {}, variableVariationMap: {} }) // config
        
        // Should load config since it's within 30-day TTL
        const result = await store.loadConfig(user) // No TTL provided, should use default
        expect(result).not.toBeNull()
        
        // Mock cached data that is 31 days old (should be expired)
        const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000)
        localStorage.load
            .mockReturnValueOnce('test_user') // user_id
            .mockReturnValueOnce(thirtyOneDaysAgo.toString()) // fetch_date
        
        // Should return null since it's older than 30-day TTL
        const expiredResult = await store.loadConfig(user) // No TTL provided, should use default
        expect(expiredResult).toBeNull()
    })

    it('should consistently hash the same user_id to the same value', async () => {
        const store = new Store(localStorage)
        const userId = 'test_user_123'
        
        const hash1 = store.hashUserId(userId)
        const hash2 = store.hashUserId(userId)
        
        expect(hash1).toBe(hash2)
        expect(hash1).not.toBe(userId) // Verify it's actually hashed
    })

    it('should hash different user_ids to different values', async () => {
        const store = new Store(localStorage)
        const userId1 = 'user1'
        const userId2 = 'user2'
        
        const hash1 = store.hashUserId(userId1)
        const hash2 = store.hashUserId(userId2)
        
        expect(hash1).not.toBe(hash2)
    })
})
