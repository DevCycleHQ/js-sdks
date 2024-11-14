import EventSource from 'react-native-sse'
import type { DVCLogger } from '@devcycle/types'

type SSEConnectionFunctions = {
    onMessage: (message: unknown) => void
    onOpen: () => void
    onConnectionError: () => void
}

export class ReactNativeSSEConnection {
    private connection?: EventSource

    constructor(
        private url: string,
        private logger: DVCLogger,
        private readonly callbacks: SSEConnectionFunctions,
    ) {
        this.openConnection()
    }

    private openConnection() {
        this.connection = new EventSource(this.url, {
            headers: {
                // Add any necessary headers here
            },
        })

        this.connection.addEventListener('open', () => {
            this.logger.debug('ReactNativeSSEConnection opened')
            this.callbacks.onOpen()
        })

        this.connection.addEventListener('message', (event) => {
            this.callbacks.onMessage(event.data)
        })

        this.connection.addEventListener('error', (error) => {
            this.logger.warn(
                `ReactNativeSSEConnection warning. Connection failed. Error: ${JSON.stringify(
                    error,
                )}`,
            )
            this.callbacks.onConnectionError()
        })
    }

    isConnected(): boolean {
        return this.connection?.readyState === EventSource.OPEN
    }

    reopen(): void {
        if (!this.isConnected()) {
            this.close()
            this.openConnection()
        }
    }

    close(): void {
        this.connection?.close()
    }
}
