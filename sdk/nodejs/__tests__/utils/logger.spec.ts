import { dvcDefaultLogger } from '../../src/utils/logger'

describe('logger unit tests', () => {
    const consoleLogSpy = jest.spyOn(console, 'log')

    beforeEach(() => {
        consoleLogSpy.mockClear()
    })

    afterAll(() => {
        consoleLogSpy.mockRestore()
    })

    it('should create default logger with error log level', () => {
        const logger = dvcDefaultLogger()
        logger.error('error message')
        logger.debug('debug message')

        expect(consoleLogSpy).toHaveBeenCalledTimes(1)
        expect(consoleLogSpy).toHaveBeenNthCalledWith(
            1,
            '[DevCycle]: error message',
        )
    })

    it('should create default logger with debug log level', () => {
        const logger = dvcDefaultLogger({ level: 'debug' })
        logger.error('error message')
        logger.debug('debug message')

        expect(consoleLogSpy).toHaveBeenCalledTimes(2)
        expect(consoleLogSpy).toHaveBeenNthCalledWith(
            1,
            '[DevCycle]: error message',
        )
        expect(consoleLogSpy).toHaveBeenNthCalledWith(
            2,
            '[DevCycle]: debug message',
        )
    })

    it('should create logger using logWriter', () => {
        const logWriter = jest.fn()
        const logger = dvcDefaultLogger({ logWriter })
        logger.error('error message')

        expect(logWriter).toHaveBeenCalledWith('[DevCycle]: error message')
    })
})
