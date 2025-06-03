import { CacheStore } from '../src/CacheStore'
import { StoreKey } from '../src/types'
import { DVCPopulatedUser } from '../src/User'

describe('CacheStore tests', () => {
    const localStorage = {
        load: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        listKeys: jest.fn(),
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
        localStorage.listKeys.mockReset()
        mockLogger.error.mockReset()
        mockLogger.warn.mockReset()
        mockLogger.info.mockReset()
        mockLogger.debug.mockReset()
    })

    it('should save config to local storage', async () => {
        jest.useFakeTimers()
        const ttl = 30 * 24 * 60 * 60 * 1000 // 30 days
        const store = new CacheStore(localStorage, mockLogger, ttl)
        const config = {}
        const user = new DVCPopulatedUser({ user_id: 'test_user' }, {})
        const now = Date.now()
        store.saveConfig(config, user)

        // Check if it's using the new user-specific key format
        const expectedKey = `${StoreKey.IdentifiedConfig}.${user.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(expectedKey, config)
        expect(localStorage.save).toHaveBeenCalledWith(
            `${expectedKey}.expiry_date`,
            now + ttl,
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
            variables: {},
        }

        // Use a future expiry date that won't be expired
        const futureExpiryDate = Date.now() + 60000 // 1 minute from now

        // Mock no legacy configs so migration doesn't interfere
        localStorage.load.mockImplementation((key) => {
            const expectedKey = `${StoreKey.IdentifiedConfig}.test_user`
            const expectedExpiryKey = `${expectedKey}.expiry_date`

            if (key === expectedKey) {
                return Promise.resolve(config)
            }
            if (key === expectedExpiryKey) {
                return Promise.resolve(futureExpiryDate.toString())
            }
            // Return undefined for any other keys (legacy keys)
            return Promise.resolve(undefined)
        })

        const store = new CacheStore(localStorage, mockLogger)
        const result = await store.loadConfig(user)

        expect(result).toEqual(config)
        expect(localStorage.load).toHaveBeenCalledWith(
            `${StoreKey.IdentifiedConfig}.test_user`,
        )
    })

    it('should migrate legacy configs when loading config and no new format exists', async () => {
        const config = {
            features: {},
            project: {},
            environment: {},
            featureVariationMap: {},
            variableVariationMap: {},
            variables: {},
        }

        // Set up mocks for legacy format
        const legacyKey = StoreKey.IdentifiedConfig
        let migratedConfig = null
        let migratedExpiryDate = null

        localStorage.load.mockImplementation((key) => {
            // Return migrated config if it has been saved
            const newConfigKey = `${StoreKey.IdentifiedConfig}.test_user`
            const newExpiryKey = `${newConfigKey}.expiry_date`

            if (key === newConfigKey && migratedConfig) {
                return migratedConfig
            }
            if (key === newExpiryKey && migratedExpiryDate) {
                return migratedExpiryDate.toString()
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
            const newExpiryKey = `${newConfigKey}.expiry_date`

            if (key === newConfigKey) {
                migratedConfig = value
            }
            if (key === newExpiryKey) {
                migratedExpiryDate = value
            }
        })

        const store = new CacheStore(localStorage, mockLogger)
        const user = new DVCPopulatedUser({ user_id: 'test_user' }, {})

        // Load config should trigger migration
        const result = await store.loadConfig(user)

        // Verify migration attempted to load legacy format
        expect(localStorage.load).toHaveBeenCalledWith(legacyKey)
        expect(localStorage.load).toHaveBeenCalledWith(`${legacyKey}.user_id`)

        // And migrated to new format
        const newKey = `${StoreKey.IdentifiedConfig}.test_user`
        expect(localStorage.save).toHaveBeenCalledWith(newKey, config)

        // And cleaned up legacy storage
        expect(localStorage.remove).toHaveBeenCalledWith(legacyKey)
        expect(localStorage.remove).toHaveBeenCalledWith(`${legacyKey}.user_id`)
        expect(localStorage.remove).toHaveBeenCalledWith(
            `${legacyKey}.fetch_date`,
        )
        expect(localStorage.remove).toHaveBeenCalledWith(StoreKey.User)

        // Should return the migrated config
        expect(result).toBe(config)
    })

    it('should use different keys for anonymous vs identified users', async () => {
        const ttl = 30 * 24 * 60 * 60 * 1000 // 30 days
        const store = new CacheStore(localStorage, mockLogger, ttl)
        const identifiedUser = new DVCPopulatedUser(
            { user_id: 'identified_user' },
            {},
        )
        const anonymousUser = new DVCPopulatedUser(
            { user_id: 'anon_user', isAnonymous: true },
            {},
        )
        const config = {}

        // Save configs for both user types
        store.saveConfig(config, identifiedUser)
        store.saveConfig(config, anonymousUser)

        // Check identified user uses IdentifiedConfig key
        const identifiedKey = `${StoreKey.IdentifiedConfig}.${identifiedUser.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(identifiedKey, config)

        // Check anonymous user uses AnonymousConfig key
        const anonymousKey = `${StoreKey.AnonymousConfig}.${anonymousUser.user_id}`
        expect(localStorage.save).toHaveBeenCalledWith(anonymousKey, config)
    })

    it('should cleanup expired configs', async () => {
        const store = new CacheStore(localStorage, mockLogger)
        const now = Date.now()
        const expiredKeys = [
            'dvc:identified_config.old_user1',
            'dvc:identified_config.old_user2',
            'dvc:anonymous_config.old_anon_user',
        ]

        // Mock listKeys to return expired config keys
        localStorage.listKeys.mockImplementation((prefix) => {
            if (prefix === StoreKey.IdentifiedConfig) {
                return [
                    'dvc:identified_config.old_user1',
                    'dvc:identified_config.old_user2',
                ]
            }
            if (prefix === StoreKey.AnonymousConfig) {
                return ['dvc:anonymous_config.old_anon_user']
            }
            return []
        })

        // Mock load to return expired dates for these configs
        localStorage.load.mockImplementation((key) => {
            if (key.endsWith('.expiry_date')) {
                return (now - 1000).toString() // Expired 1 second ago
            }
            return null
        })

        await store.cleanupExpiredConfigs()

        // Verify expired configs were removed
        expiredKeys.forEach((key) => {
            expect(localStorage.remove).toHaveBeenCalledWith(key)
            expect(localStorage.remove).toHaveBeenCalledWith(
                `${key}.expiry_date`,
            )
        })
    })
})
