import EventSource from 'react-native-sse'
import type { DVCLogger } from '@devcycle/types'
import type { SSEConnectionFunctions } from '@devcycle/sse-connection'

export class ReactNativeSSEConnection {
    private connection?: EventSource
    private connected = false

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
            this.connected = true
            this.callbacks.onOpen()
        })

        this.connection.addEventListener('close', () => {
            this.logger.debug('ReactNativeSSEConnection closed')
            this.connected = false
        })

        this.connection.addEventListener('message', (event) => {
            this.logger.debug(
                `ReactNativeSSEConnection message received: ${JSON.stringify(
                    event,
                )}`,
            )
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
        return this.connected
    }

    reopen(): void {
        if (!this.isConnected()) {
            this.logger.debug('ReactNativeSSEConnection reopening')
            this.close()
            this.openConnection()
        }
    }

    close(): void {
        this.logger.debug('ReactNativeSSEConnection closing')
        this.connection?.close()
    }
}
