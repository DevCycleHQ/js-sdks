import type { DVCLogger } from '@devcycle/types'
import EventSource from 'eventsource'

type SSEConnectionFunctions = {
    onMessage: (message: unknown) => void
    onOpen: () => void
    onConnectionError: () => void
}

export class SSEConnection {
    private connection?: EventSource

    constructor(
        private url: string,
        private logger: DVCLogger,
        private readonly callbacks: SSEConnectionFunctions,
    ) {
        this.openConnection()
    }

    private openConnection() {
        if (typeof EventSource === 'undefined') {
            this.logger.warn(
                'SSEConnection not opened. EventSource is not available.',
            )
            return
        }
        this.connection = new EventSource(this.url, { withCredentials: true })
        this.connection.onmessage = (event) => {
            this.callbacks.onMessage(event.data)
        }
        this.connection.onerror = (err) => {
            this.logger.warn(
                `SSEConnection warning. Connection failed to establish. Error status: ${err.status}`,
            )
            this.callbacks.onConnectionError()
        }
        this.connection.onopen = () => {
            this.logger.debug('SSEConnection opened')
            this.callbacks.onOpen()
        }
    }

    isConnected(): boolean {
        return this.connection?.readyState === this.connection?.OPEN
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
