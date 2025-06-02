import { CacheStore } from '../src/CacheStore'
import { StoreKey } from '../src/types'
import { DVCPopulatedUser } from '../src/User'

describe('CacheStore tests', () => {
    const localStorage = {
        load: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    }

    const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    }

    beforeEach(() => {
        localStorage.load.mockReset()
        localStorage.save.mockReset()
        localStorage.remove.mockReset()
        mockLogger.error.mockReset()
        mockLogger.warn.mockReset()
        mockLogger.info.mockReset()
        mockLogger.debug.mockReset()
    })

    it('should save config to local storage', async () => {
        jest.useFakeTimers()
        const store = new CacheStore(localStorage, mockLogger)
        const config = {}
        const user = new DVCPopulatedUser({ user_id: 'test_user' }, {})
        const now = Date.now()
        store.saveConfig(config, user, now)
        
        // Check if it's using the new user-specific key format
        const expectedKey = `${StoreKey.IdentifiedConfig}.${user.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(
            expectedKey,
            config,
        )
        expect(localStorage.save).toHaveBeenCalledWith(
            `${expectedKey}.fetch_date`,
            now,
        )
    })

    it('should load config from local storage using user-specific key', async () => {
        const user = new DVCPopulatedUser({ user_id: 'test_user' }, {})
        const config = { 
            features: {}, 
            project: {}, 
            environment: {},
            featureVariationMap: {},
            variableVariationMap: {},
            variables: {}
        }
        
        // Use a recent date that won't be expired
        const recentDate = Date.now() - 1000 // 1 second ago
        
        // Mock no legacy configs so migration doesn't interfere
        localStorage.load.mockImplementation((key) => {
            const expectedKey = `${StoreKey.IdentifiedConfig}.test_user`
            const expectedDateKey = `${expectedKey}.fetch_date`
            
            if (key === expectedKey) {
                return config
            }
            if (key === expectedDateKey) {
                return recentDate.toString()
            }
            // Return null for any legacy keys to avoid migration interference
            if (key === StoreKey.IdentifiedConfig || key === StoreKey.AnonymousConfig || key === StoreKey.User) {
                return null
            }
            return null
        })
        
        const store = new CacheStore(localStorage, mockLogger)
        
        const result = await store.loadConfig(user, 2592000000) // 30 days
        
        const expectedKey = `${StoreKey.IdentifiedConfig}.${user.user_id}`
        expect(localStorage.load).toHaveBeenCalledWith(expectedKey)
        expect(localStorage.load).toHaveBeenCalledWith(`${expectedKey}.fetch_date`)
        expect(result).toBe(config)
    })

    it('should migrate legacy configs when loading config and no new format exists', async () => {
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
        let migratedConfig = null
        let migratedFetchDate = null
        
        localStorage.load.mockImplementation((key) => {
            // Return migrated config if it has been saved
            const newConfigKey = `${StoreKey.IdentifiedConfig}.test_user`
            const newFetchDateKey = `${newConfigKey}.fetch_date`
            
            if (key === newConfigKey && migratedConfig) {
                return migratedConfig
            }
            if (key === newFetchDateKey && migratedFetchDate) {
                return migratedFetchDate.toString()
            }
            
            // Legacy data
            if (key === legacyKey) return config
            if (key === `${legacyKey}.user_id`) return 'test_user'
            if (key === `${legacyKey}.fetch_date`) return Date.now().toString() // Recent date
            
            // No legacy user data
            if (key === StoreKey.User) return null
            
            return null
        })
        
        localStorage.save.mockImplementation((key, value) => {
            const newConfigKey = `${StoreKey.IdentifiedConfig}.test_user`
            const newFetchDateKey = `${newConfigKey}.fetch_date`
            
            if (key === newConfigKey) {
                migratedConfig = value
            }
            if (key === newFetchDateKey) {
                migratedFetchDate = value
            }
        })
        
        const store = new CacheStore(localStorage, mockLogger)
        const user = new DVCPopulatedUser({ user_id: 'test_user' }, {})
        
        // Load config should trigger migration
        const result = await store.loadConfig(user, 2592000000) // 30 days
        
        // Verify migration attempted to load legacy format
        expect(localStorage.load).toHaveBeenCalledWith(legacyKey)
        expect(localStorage.load).toHaveBeenCalledWith(`${legacyKey}.user_id`)
        expect(localStorage.load).toHaveBeenCalledWith(`${legacyKey}.fetch_date`)
        
        // And migrated to new format
        const newKey = `${StoreKey.IdentifiedConfig}.test_user`
        expect(localStorage.save).toHaveBeenCalledWith(newKey, config)
        
        // And cleaned up legacy storage
        expect(localStorage.remove).toHaveBeenCalledWith(legacyKey)
        expect(localStorage.remove).toHaveBeenCalledWith(`${legacyKey}.user_id`)
        expect(localStorage.remove).toHaveBeenCalledWith(`${legacyKey}.fetch_date`)
        
        // Should return the migrated config
        expect(result).toBe(config)
    })

    it('should use different keys for anonymous vs identified users', async () => {
        const store = new CacheStore(localStorage, mockLogger)
        const identifiedUser = new DVCPopulatedUser({ user_id: 'identified_user' }, {})
        const anonymousUser = new DVCPopulatedUser({ user_id: 'anon_user', isAnonymous: true }, {})
        const config = {}
        const now = Date.now()

        // Save configs for both user types
        store.saveConfig(config, identifiedUser, now)
        store.saveConfig(config, anonymousUser, now)
        
        // Check identified user uses IdentifiedConfig key
        const identifiedKey = `${StoreKey.IdentifiedConfig}.${identifiedUser.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(
            identifiedKey,
            config,
        )
        
        // Check anonymous user uses AnonymousConfig key
        const anonymousKey = `${StoreKey.AnonymousConfig}.${anonymousUser.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(
            anonymousKey,
            config,
        )
    })
})
