import { isNumber } from 'lodash'
import {
    DVCDefaultLoggerOptions, DVCLogger
} from '../../types'

const prefix = '[DevCycle]: '
export enum DVCLogLevels {
    debug,
    info,
    warn,
    error
}

export function defaultLogger(options?: DVCDefaultLoggerOptions): DVCLogger {
    const minLevel = (options?.level && isNumber(DVCLogLevels[options?.level]))
        ? DVCLogLevels[options?.level]
        : DVCLogLevels.info
    const logWriter = options?.logWriter || console.error

    const writeLog = (message: string): void => logWriter(prefix + message)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noOpLog = (message: string): void => { }

    return {
        error: DVCLogLevels.error >= minLevel ? writeLog : noOpLog,
        warn: DVCLogLevels.warn >= minLevel ? writeLog : noOpLog,
        info: DVCLogLevels.info >= minLevel ? writeLog : noOpLog,
        debug: DVCLogLevels.debug >= minLevel ? writeLog : noOpLog,
    }
}
