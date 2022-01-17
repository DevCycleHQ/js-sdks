jest.spyOn(console, 'error').mockImplementation()
import { defaultLogger } from '../../src/utils/logger'
import { mocked } from 'ts-jest/utils'
const consoleError_mock = mocked(console.error)

describe('logger unit tests', () => {
    beforeEach(() => consoleError_mock.mockReset())

    it('should create default logger with info log level', () => {
        const logger = defaultLogger()
        logger.error('error message')
        logger.debug('debug message')

        expect(consoleError_mock).toHaveBeenCalledTimes(1)
        expect(consoleError_mock).toBeCalledWith('[DevCycle]: error message')
    })

    it('should create default logger with debug log level', () => {
        const logger = defaultLogger({ level: 'debug' })
        logger.error('error message')
        logger.debug('debug message')

        expect(consoleError_mock).toHaveBeenCalledTimes(2)
        expect(consoleError_mock).toHaveBeenNthCalledWith(1, '[DevCycle]: error message')
        expect(consoleError_mock).toHaveBeenNthCalledWith(2, '[DevCycle]: debug message')
    })

    it('should create logger using logWriter', () => {
        const logWriter = jest.fn()
        const logger = defaultLogger({ logWriter })
        logger.error('error message')

        expect(logWriter).toHaveBeenCalledWith('[DevCycle]: error message')
    })
})
