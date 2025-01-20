import EventSource from 'react-native-sse'
import type { DVCLogger, SSEConnectionInterface } from '@devcycle/types'

export class ReactNativeSSEConnection implements SSEConnectionInterface {
    private connection?: EventSource
    private isConnectionOpen = false

    constructor(
        private url: string,
        private onMessage: (message: unknown) => void,
        private logger: DVCLogger,
    ) {
        this.openConnection()
    }

    public updateURL(url: string): void {
        this.close()
        this.url = url
        this.openConnection()
    }

    private openConnection() {
        this.connection = new EventSource(this.url, {
            debug: false,
            // start connection immediately
            timeoutBeforeConnection: 0,
            // disable request timeout so connections are kept open
            timeout: 0,
            // enable withCredentials so we can send cookies
            withCredentials: true,
        })

        this.connection.addEventListener('message', (event) => {
            this.logger.debug(`ReactNativeSSEConnection message. ${event.data}`)
            this.onMessage(event.data)
        })

        this.connection.addEventListener('error', (error) => {
            this.logger.error(
                `ReactNativeSSEConnection error. ${
                    (error as any)?.message || JSON.stringify(error)
                }`,
            )
        })

        this.connection.addEventListener('open', () => {
            this.logger.debug('ReactNativeSSEConnection opened')
            this.isConnectionOpen = true
        })
        this.connection.addEventListener('close', () => {
            this.logger.debug('ReactNativeSSEConnection closed')
            this.isConnectionOpen = false
        })
    }

    isConnected(): boolean {
        return this.isConnectionOpen
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
