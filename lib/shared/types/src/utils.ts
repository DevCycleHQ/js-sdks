// Type to retrieve the element type from an array
// eg. ArrayElement<string[]> -> string
export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// DVC Logger Shared types, used by JS and NodeJS SDKs
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