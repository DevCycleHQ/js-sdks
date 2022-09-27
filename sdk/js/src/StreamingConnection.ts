import { DVCLogger } from '@devcycle/types'

export class StreamingConnection {
    private connection: EventSource

    constructor(
        url: string,
        onMessage: (message: unknown) => void,
        logger: DVCLogger
    ) {
        this.connection = new EventSource(url, { withCredentials: true })
        this.connection.onmessage = (event) => {
            onMessage(event.data)
        }
        this.connection.onerror = (err) => {
            logger.error('StreamingConnection error', err)
        }
        this.connection.onopen = () => {
            logger.debug('StreamingConnection opened')
        }
    }

    isConnected(): boolean {
        return this.connection.readyState === this.connection.OPEN
    }

    close(): void {
        this.connection.close()
    }
}
