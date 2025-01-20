import type { DVCLogger } from '../logger'

export interface SSEConnectionInterface {
    updateURL(url: string): void
    isConnected(): boolean
    reopen(): void
    close(): void
}

export interface SSEConnectionConstructor {
    new (
        url: string,
        onMessage: (message: unknown) => void,
        logger: DVCLogger,
    ): SSEConnectionInterface
}
