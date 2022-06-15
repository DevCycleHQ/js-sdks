export interface DVCLogger {
  error(message: string): void

  warn(message: string): void

  info(message: string): void

  debug(message: string): void
}

export type DVCDefaultLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type DVCDefaultLoggerOptions = {
  level?: DVCDefaultLogLevel

  logWriter?: (message: string) => void
}

export type defaultLogger = (options?: DVCDefaultLoggerOptions) => DVCLogger