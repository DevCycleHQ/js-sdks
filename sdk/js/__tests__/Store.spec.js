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
        const now = Date.now()
        store.saveConfig(config, user, now)
        
        // Check if it's using the new user-specific key format
        const expectedKey = `${StoreKey.UserConfig}.${user.user_id}`
        expect(localStorage.save).toBeCalledWith(
            expectedKey,
            config,
        )
        expect(localStorage.save).toBeCalledWith(
            `${expectedKey}.fetch_date`,
            now,
        )
    })

    it('should load config from local storage using user-specific key', async () => {
        const store = new Store(localStorage)
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        const config = { 
            features: {}, 
            project: {}, 
            environment: {},
            featureVariationMap: {},
            variableVariationMap: {},
            variables: {}
        }
        
        // Set up mocks for the new user-specific format
        const expectedKey = `${StoreKey.UserConfig}.${user.user_id}`
        localStorage.load.mockImplementation((key) => {
            if (key === expectedKey) return config
            if (key === `${expectedKey}.fetch_date`) return '1622548800000' // Recent date
            return null
        })
        
        const result = await store.loadConfig(user, 2592000000) // 30 days
        
        expect(localStorage.load).toBeCalledWith(expectedKey)
        expect(localStorage.load).toBeCalledWith(`${expectedKey}.fetch_date`)
        expect(result).toBe(config)
    })

    it('should load legacy config and migrate to new format', async () => {
        const store = new Store(localStorage)
        const user = new DVCPopulatedUser({ user_id: 'test_user' })
        const config = { 
            features: {}, 
            project: {}, 
            environment: {},
            featureVariationMap: {},
            variableVariationMap: {},
            variables: {}
        }
        
        // Set up mocks for legacy format
        const legacyKey = StoreKey.IdentifiedConfig
        localStorage.load.mockImplementation((key) => {
            if (key === legacyKey) return config
            if (key === `${legacyKey}.user_id`) return 'test_user'
            if (key === `${legacyKey}.fetch_date`) return '1622548800000' // Recent date
            return null
        })
        
        const result = await store.loadConfig(user, 2592000000) // 30 days
        
        // Verify it tried to load with the new format first
        const newKey = `${StoreKey.UserConfig}.${user.user_id}`
        expect(localStorage.load).toBeCalledWith(newKey)
        
        // Then fell back to legacy format
        expect(localStorage.load).toBeCalledWith(legacyKey)
        expect(localStorage.load).toBeCalledWith(`${legacyKey}.user_id`)
        expect(localStorage.load).toBeCalledWith(`${legacyKey}.fetch_date`)
        
        // And migrated to new format
        expect(localStorage.save).toBeCalledWith(newKey, config)
        expect(result).toBe(config)
    })

    it('should use different keys for anonymous vs identified users', async () => {
        const store = new Store(localStorage)
        const identifiedUser = new DVCPopulatedUser({ user_id: 'identified_user' })
        const anonymousUser = new DVCPopulatedUser({ user_id: 'anon_user', isAnonymous: true })
        const config = {}
        const now = Date.now()

        // Save configs for both user types
        store.saveConfig(config, identifiedUser, now)
        store.saveConfig(config, anonymousUser, now)
        
        // Check identified user uses UserConfig key
        const identifiedKey = `${StoreKey.UserConfig}.${identifiedUser.user_id}`
        expect(localStorage.save).toBeCalledWith(
            identifiedKey,
            config,
        )
        
        // Check anonymous user uses AnonymousConfig key
        const anonymousKey = `${StoreKey.AnonymousConfig}.${anonymousUser.user_id}`
        expect(localStorage.save).toBeCalledWith(
            anonymousKey,
            config,
        )
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
