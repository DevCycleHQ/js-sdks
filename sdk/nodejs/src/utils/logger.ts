import isNumber from 'lodash/isNumber'
import { DVCDefaultLoggerOptions, DVCLogger } from '@devcycle/types'

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

  const writeLog = (message: string): void => logWriter(prefix + message)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noOpLog = (message: string): void => {}

  return {
    error: DVCLogLevels.error >= minLevel ? writeLog : noOpLog,
    warn: DVCLogLevels.warn >= minLevel ? writeLog : noOpLog,
    info: DVCLogLevels.info >= minLevel ? writeLog : noOpLog,
    debug: DVCLogLevels.debug >= minLevel ? writeLog : noOpLog,
  }
}
