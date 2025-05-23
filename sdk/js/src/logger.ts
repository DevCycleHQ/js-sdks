import isNumber from 'lodash/isNumber'
import type { DVCDefaultLoggerOptions, DVCLogger } from '@devcycle/types'

const prefix = '[DevCycle]: '
export enum DVCLogLevels {
    debug,
    info,
    warn,
    error,
}

export function dvcDefaultLogger(options?: DVCDefaultLoggerOptions): DVCLogger {
    const minLevel =
        options?.level && isNumber(DVCLogLevels[options?.level])
            ? DVCLogLevels[options?.level]
            : DVCLogLevels.error
    const logWriter = options?.logWriter || console.log
    const errorWriter = options?.logWriter || console.error

    const writeLog = (message: string): void => logWriter(prefix + message)
    const writeError = (message: string, error: unknown): void =>
        errorWriter(prefix + message, error)
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    const noOpLog = (message: string): void => {}

    return {
        error: DVCLogLevels.error >= minLevel ? writeError : noOpLog,
        warn: DVCLogLevels.warn >= minLevel ? writeLog : noOpLog,
        info: DVCLogLevels.info >= minLevel ? writeLog : noOpLog,
        debug: DVCLogLevels.debug >= minLevel ? writeLog : noOpLog,
    }
}
