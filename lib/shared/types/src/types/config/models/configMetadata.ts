export class ConfigMetadata {
    readonly project: ProjectMetadata
    readonly environment: EnvironmentMetadata

    constructor(project: ProjectMetadata, environment: EnvironmentMetadata) {
        this.project = project
        this.environment = environment
    }
}

export class ProjectMetadata {
    readonly id: string
    readonly key: string

    constructor(_id: string, key: string) {
        this.id = _id
        this.key = key
    }
}
export class EnvironmentMetadata {
    readonly id: string
    readonly key: string

    constructor(_id: string, key: string) {
        this.id = _id
        this.key = key
    }
}
