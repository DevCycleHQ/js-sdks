export class EnvironmentConfigManager {
    config: unknown
    cleanup(): void {
        return
    }

    getConfigURL(): string {
        return 'url'
    }

    async _fetchConfig(): Promise<void> {
        this.config = {}
    }
}
