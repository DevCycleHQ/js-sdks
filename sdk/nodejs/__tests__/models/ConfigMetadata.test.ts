import { ConfigMetadata } from '../../src/models/ConfigMetadata'
import { ProjectMetadata } from '../../src/models/ProjectMetadata'
import { EnvironmentMetadata } from '../../src/models/EnvironmentMetadata'

describe('ConfigMetadata', () => {
    const mockProject = { _id: 'project-123', key: 'test-project' }
    const mockEnvironment = { _id: 'env-456', key: 'development' }

    describe('constructor', () => {
        it('should create ConfigMetadata with all required fields', () => {
            const metadata = new ConfigMetadata(
                'etag-123',
                '2023-01-01T00:00:00Z',
                new ProjectMetadata('project-123', 'test-project'),
                new EnvironmentMetadata('env-456', 'development')
            )

            expect(metadata.configETag).toBe('etag-123')
            expect(metadata.configLastModified).toBe('2023-01-01T00:00:00Z')
            expect(metadata.project.id).toBe('project-123')
            expect(metadata.project.key).toBe('test-project')
            expect(metadata.environment.id).toBe('env-456')
            expect(metadata.environment.key).toBe('development')
        })
    })

    describe('fromConfigResponse', () => {
        it('should create ConfigMetadata from config response with valid headers', () => {
            const metadata = ConfigMetadata.fromConfigResponse(
                'etag-123',
                '2023-01-01T00:00:00Z',
                mockProject,
                mockEnvironment
            )

            expect(metadata).not.toBeNull()
            expect(metadata!.configETag).toBe('etag-123')
            expect(metadata!.configLastModified).toBe('2023-01-01T00:00:00Z')
            expect(metadata!.project.id).toBe('project-123')
            expect(metadata!.project.key).toBe('test-project')
            expect(metadata!.environment.id).toBe('env-456')
            expect(metadata!.environment.key).toBe('development')
        })

        it('should return null when etag is missing', () => {
            const metadata = ConfigMetadata.fromConfigResponse(
                null,
                '2023-01-01T00:00:00Z',
                mockProject,
                mockEnvironment
            )

            expect(metadata).toBeNull()
        })

        it('should return null when lastModified is missing', () => {
            const metadata = ConfigMetadata.fromConfigResponse(
                'etag-123',
                null,
                mockProject,
                mockEnvironment
            )

            expect(metadata).toBeNull()
        })

        it('should return null when both etag and lastModified are missing', () => {
            const metadata = ConfigMetadata.fromConfigResponse(
                null,
                null,
                mockProject,
                mockEnvironment
            )

            expect(metadata).toBeNull()
        })
    })

    describe('createDefault', () => {
        it('should create ConfigMetadata with default values', () => {
            const metadata = ConfigMetadata.createDefault(mockProject, mockEnvironment)

            expect(metadata.configETag).toBe('')
            expect(metadata.configLastModified).toBe('')
            expect(metadata.project.id).toBe('project-123')
            expect(metadata.project.key).toBe('test-project')
            expect(metadata.environment.id).toBe('env-456')
            expect(metadata.environment.key).toBe('development')
        })
    })

    describe('toString', () => {
        it('should return string representation with all metadata', () => {
            const metadata = new ConfigMetadata(
                'etag-123',
                '2023-01-01T00:00:00Z',
                new ProjectMetadata('project-123', 'test-project'),
                new EnvironmentMetadata('env-456', 'development')
            )

            const result = metadata.toString()
            expect(result).toContain('etag-123')
            expect(result).toContain('2023-01-01T00:00:00Z')
            expect(result).toContain('test-project')
            expect(result).toContain('development')
        })
    })
})