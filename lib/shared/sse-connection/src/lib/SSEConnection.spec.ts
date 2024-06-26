jest.mock('eventsource')

import { SSEConnection } from './SSEConnection'
import EventSource from 'eventsource'

const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
}
const mockSSEConnectionFunctions = {
    onMessage: jest.fn(),
    onOpen: jest.fn(),
    onConnectionError: jest.fn(),
}

describe('SSEConnection', () => {
    beforeAll(() => {
        Object.defineProperty(EventSource.prototype, 'readyState', {
            get: jest.fn(() => EventSource.OPEN),
        })
        // jest mock EventSource.close function
        EventSource.prototype.close = jest.fn()
    })

    it('should create a SSE connection and open an EventSource connection', () => {
        const url = 'http://localhost:8080'
        const connection = new SSEConnection(
            url,
            mockLogger,
            mockSSEConnectionFunctions,
        )
        expect(EventSource).toHaveBeenCalledWith(url, { withCredentials: true })
        expect(connection.isConnected()).toBe(true)
    })

    it('should close the EventSource connection', () => {
        const connection = new SSEConnection(
            'http://localhost:8080',
            mockLogger,
            mockSSEConnectionFunctions,
        )
        connection.close()
        expect(EventSource.prototype.close).toHaveBeenCalled()
    })

    it('should reopen the EventSource connection', () => {
        const connection = new SSEConnection(
            'http://localhost:8080',
            mockLogger,
            mockSSEConnectionFunctions,
        )
        connection.reopen()
        expect(EventSource.prototype.close).toHaveBeenCalled()
        expect(EventSource).toHaveBeenCalledTimes(3)
    })
})
