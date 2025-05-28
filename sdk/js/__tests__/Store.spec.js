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
        await store.saveConfig(config, user, Date.now())
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
        expect(localStorage.load).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:test_user`,
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

    it('should use different cache keys for different identified users', async () => {
        const store = new Store(localStorage)
        const config = {}
        const user1 = new DVCPopulatedUser({ user_id: 'user1' })
        const user2 = new DVCPopulatedUser({ user_id: 'user2' })

        // Save config for user1
        await store.saveConfig(config, user1, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:user1`,
            config,
        )

        // Save config for user2
        await store.saveConfig(config, user2, Date.now())
        expect(localStorage.save).toBeCalledWith(
            `${StoreKey.IdentifiedConfig}:user2`,
            config,
        )
    })

    it('should use anonymous cache key for anonymous users regardless of user_id', async () => {
        const store = new Store(localStorage)
        const config = {}
        const anonymousUser1 = new DVCPopulatedUser({
            user_id: 'anon1',
            isAnonymous: true,
        })
        const anonymousUser2 = new DVCPopulatedUser({
            user_id: 'anon2',
            isAnonymous: true,
        })

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
        const twentyNineDaysAgo = now - 29 * 24 * 60 * 60 * 1000
        localStorage.load
            .mockReturnValueOnce('test_user') // user_id
            .mockReturnValueOnce(twentyNineDaysAgo.toString()) // fetch_date
            .mockReturnValueOnce({
                features: {},
                variables: {},
                project: {},
                environment: {},
                featureVariationMap: {},
                variableVariationMap: {},
            }) // config

        // Should load config since it's within 30-day TTL
        const result = await store.loadConfig(user) // No TTL provided, should use default
        expect(result).not.toBeNull()

        // Mock cached data that is 31 days old (should be expired)
        const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000
        localStorage.load
            .mockReturnValueOnce('test_user') // user_id
            .mockReturnValueOnce(thirtyOneDaysAgo.toString()) // fetch_date

        // Should return null since it's older than 30-day TTL
        const expiredResult = await store.loadConfig(user) // No TTL provided, should use default
        expect(expiredResult).toBeNull()
    })
    
    it('should migrate config from legacy format to new per-user format', async () => {
        const store = new Store(localStorage)
        const validConfig = {
            features: {},
            variables: {},
            project: {},
            environment: {},
            featureVariationMap: {},
            variableVariationMap: {},
        }
        const user = new DVCPopulatedUser({ user_id: 'migrated_user' })
        const fetchDate = Date.now().toString()
        
        // First load of user-specific key finds no config
        localStorage.load
            .mockReturnValueOnce(undefined) // No user_id in new format
            .mockReturnValueOnce('migrated_user') // Legacy user_id matches
            .mockReturnValueOnce(validConfig) // Legacy config exists
            .mockReturnValueOnce(fetchDate) // Legacy fetch date exists
            .mockReturnValueOnce('migrated_user') // Check user_id after migration
            .mockReturnValueOnce(fetchDate) // fetch_date after migration
            .mockReturnValueOnce(validConfig) // config after migration

        const result = await store.loadConfig(user)
        
        // Verify migration saved to new format
        expect(localStorage.save).toHaveBeenCalledWith(
            `${StoreKey.IdentifiedConfig}:migrated_user`, 
            validConfig
        )
        expect(localStorage.save).toHaveBeenCalledWith(
            `${StoreKey.IdentifiedConfig}:migrated_user.fetch_date`, 
            fetchDate
        )
        expect(localStorage.save).toHaveBeenCalledWith(
            `${StoreKey.IdentifiedConfig}:migrated_user.user_id`, 
            'migrated_user'
        )
        
        // Verify config was returned
        expect(result).toEqual(validConfig)
    })
    
    it('should not migrate legacy config when user_id does not match', async () => {
        const store = new Store(localStorage)
        const user = new DVCPopulatedUser({ user_id: 'current_user' })
        
        // First load of user-specific key finds no config
        localStorage.load
            .mockReturnValueOnce(undefined) // No user_id in new format
            .mockReturnValueOnce('different_user') // Legacy user_id doesn't match

        const result = await store.loadConfig(user)
        
        // Verify no migration occurred
        expect(localStorage.save).not.toHaveBeenCalled()
        
        // Verify no config was returned
        expect(result).toBeNull()
    })
    
    it('should not migrate for anonymous users', async () => {
        const store = new Store(localStorage)
        const anonymousUser = new DVCPopulatedUser({ 
            user_id: 'anon_user',
            isAnonymous: true 
        })
        
        // No config for anonymous user
        localStorage.load.mockReturnValueOnce(undefined)

        const result = await store.loadConfig(anonymousUser)
        
        // Check that we didn't try to load legacy config
        expect(localStorage.load).not.toHaveBeenCalledWith(
            `${StoreKey.IdentifiedConfig}.user_id`
        )
        
        // Verify no migration occurred
        expect(localStorage.save).not.toHaveBeenCalled()
        
        // Verify no config was returned
        expect(result).toBeNull()
    })
})
