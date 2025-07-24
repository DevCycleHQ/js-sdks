export class EnvironmentMetadata {
    constructor(
        public readonly id: string,
        public readonly key: string,
    ) {}

    toString(): string {
        return `EnvironmentMetadata(id: ${this.id}, key: ${this.key})`
    }
}