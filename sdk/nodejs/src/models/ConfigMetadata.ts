import { ProjectMetadata } from './ProjectMetadata'
import { EnvironmentMetadata } from './EnvironmentMetadata'

export class ConfigMetadata {
    constructor(
        public readonly configETag: string,
        public readonly configLastModified: string,
        public readonly project: ProjectMetadata,
        public readonly environment: EnvironmentMetadata,
    ) {}

    /**
     * Creates a ConfigMetadata instance from HTTP headers and config response
     */
    static fromConfigResponse(
        etag: string | null,
        lastModified: string | null,
        project: { _id: string; key: string },
        environment: { _id: string; key: string },
    ): ConfigMetadata | null {
        if (!etag || !lastModified) {
            return null
        }

        return new ConfigMetadata(
            etag,
            lastModified,
            new ProjectMetadata(project._id, project.key),
            new EnvironmentMetadata(environment._id, environment.key),
        )
    }

    /**
     * Creates a ConfigMetadata instance with default values for testing/fallback
     */
    static createDefault(
        project: { _id: string; key: string },
        environment: { _id: string; key: string },
    ): ConfigMetadata {
        return new ConfigMetadata(
            '',
            '',
            new ProjectMetadata(project._id, project.key),
            new EnvironmentMetadata(environment._id, environment.key),
        )
    }

    toString(): string {
        return `ConfigMetadata(etag: ${this.configETag}, lastModified: ${this.configLastModified}, project: ${this.project.key}, environment: ${this.environment.key})`
    }
}