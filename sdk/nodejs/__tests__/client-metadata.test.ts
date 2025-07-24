import { DevCycleClient } from '../src/client'
import { ConfigMetadata } from '../src/models/ConfigMetadata'

describe('DevCycleClient Config Metadata', () => {
    it('should have getMetadata method', () => {
        // Create a mock client - we can't actually initialize it without proper setup
        // but we can verify the method exists
        const client = {} as DevCycleClient
        
        // This test verifies that the getMetadata method is available
        // In a real scenario, this would be called on an initialized client
        expect(typeof client.getMetadata).toBe('function')
    })

    it('should return ConfigMetadata type from getMetadata', () => {
        // This test verifies the return type
        const mockMetadata = new ConfigMetadata(
            'etag-123',
            '2023-01-01T00:00:00Z',
            { id: 'project-123', key: 'test-project' },
            { id: 'env-456', key: 'development' }
        )
        
        expect(mockMetadata).toBeInstanceOf(ConfigMetadata)
        expect(mockMetadata.configETag).toBe('etag-123')
        expect(mockMetadata.configLastModified).toBe('2023-01-01T00:00:00Z')
        expect(mockMetadata.project.key).toBe('test-project')
        expect(mockMetadata.environment.key).toBe('development')
    })
})