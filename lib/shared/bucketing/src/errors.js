class MisconfiguredFilterError extends Error {
    constructor(message, ...args) {
        super(`MisconfiguredFilterError: ${message}`, ...args)
        Error.captureStackTrace(this, this.constructor)
    }
}

exports.MisconfiguredFilterError = MisconfiguredFilterError
