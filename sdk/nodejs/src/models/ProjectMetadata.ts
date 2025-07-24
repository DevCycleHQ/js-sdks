export class ProjectMetadata {
    constructor(
        public readonly id: string,
        public readonly key: string,
    ) {}

    toString(): string {
        return `ProjectMetadata(id: ${this.id}, key: ${this.key})`
    }
}