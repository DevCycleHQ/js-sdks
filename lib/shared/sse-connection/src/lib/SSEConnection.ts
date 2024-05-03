import type { DVCLogger } from '@devcycle/types'
import EventSource from 'eventsource'

export class SSEConnection {
    private connection?: EventSource

    constructor(
        private url: string,
        private logger: DVCLogger,
        private onMessage: (message: unknown) => void,
        private onConnectionError: () => void,
    ) {
        this.openConnection()
    }

    private openConnection() {
        if (typeof EventSource === 'undefined') {
            this.logger.warn(
                'StreamingConnection not opened. EventSource is not available.',
            )
            return
        }
        this.connection = new EventSource(this.url, { withCredentials: true })
        this.connection.onmessage = (event) => {
            this.onMessage(event.data)
        }
        this.connection.onerror = () => {
            this.logger.warn(
                'StreamingConnection warning. Connection failed to establish.',
            )
            this.onConnectionError()
        }
        this.connection.onopen = () => {
            this.logger.debug('StreamingConnection opened')
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
