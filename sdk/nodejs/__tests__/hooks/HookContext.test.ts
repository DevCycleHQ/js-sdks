import { HookContext } from '../../src/hooks/HookContext'
import { ConfigMetadata } from '../../src/models/ConfigMetadata'
import { ProjectMetadata } from '../../src/models/ProjectMetadata'
import { EnvironmentMetadata } from '../../src/models/EnvironmentMetadata'

describe('HookContext', () => {
    const mockUser = { user_id: 'user-123' }
    const mockMetadata = new ConfigMetadata(
        'etag-123',
        '2023-01-01T00:00:00Z',
        new ProjectMetadata('project-123', 'test-project'),
        new EnvironmentMetadata('env-456', 'development')
    )

    describe('constructor', () => {
        it('should create HookContext with all required fields including config metadata', () => {
            const context = new HookContext(
                mockUser,
                'test-variable',
                'default-value',
                { custom: 'metadata' },
                mockMetadata
            )

            expect(context.user).toBe(mockUser)
            expect(context.variableKey).toBe('test-variable')
            expect(context.defaultValue).toBe('default-value')
            expect(context.metadata).toEqual({ custom: 'metadata' })
            expect(context.configMetadata).toBe(mockMetadata)
        })

        it('should create HookContext with null config metadata', () => {
            const context = new HookContext(
                mockUser,
                'test-variable',
                'default-value',
                { custom: 'metadata' },
                null
            )

            expect(context.configMetadata).toBeNull()
        })
    })

    describe('getConfigMetadata', () => {
        it('should return config metadata when available', () => {
            const context = new HookContext(
                mockUser,
                'test-variable',
                'default-value',
                {},
                mockMetadata
            )

            const result = context.getConfigMetadata()
            expect(result).toBe(mockMetadata)
        })

        it('should return null when config metadata is not available', () => {
            const context = new HookContext(
                mockUser,
                'test-variable',
                'default-value',
                {},
                null
            )

            const result = context.getConfigMetadata()
            expect(result).toBeNull()
        })
    })
})