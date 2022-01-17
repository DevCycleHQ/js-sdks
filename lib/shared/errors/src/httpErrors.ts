function createError(code: number, name: string) {
    return class extends Error {
        statusCode: number
        status: number
        data?: unknown

        constructor(message = '', data?: unknown) {
            super(message)
            this.name = name
            this.message = message
            this.statusCode = code
            this.status = code // fix for koa logger
            this.data = data
        }
    }
}

// 4xx errors
export const BadRequestError = createError(400, 'BadRequestError')
export const UnauthorizedError = createError(401, 'UnauthorizedError')
export const PaymentRequiredError = createError(402, 'PaymentRequiredError')
export const ForbiddenError = createError(403, 'ForbiddenError')
export const NotFoundError = createError(404, 'NotFoundError')
export const MethodNotAllowedError = createError(405, 'MethodNotAllowedError')
export const NotAcceptableError = createError(406, 'NotAcceptableError')
export const ProxyAuthenticationRequiredError = createError(407, 'ProxyAuthenticationRequiredError')
export const RequestTimeoutError = createError(408, 'RequestTimeoutError')
export const ConflictError = createError(409, 'ConflictError')
export const GoneError = createError(410, 'GoneError')
export const LengthRequiredError = createError(411, 'LengthRequiredError')
export const PreconditionFailedError = createError(412, 'PreconditionFailedError')
export const PayloadTooLargeError = createError(413, 'PayloadTooLargeError')
export const UriTooLongError = createError(414, 'UriTooLongError')
export const UnsupportedMediaTypeError = createError(415, 'UnsupportedMediaTypeError')
export const RangeNotSatisfiableError = createError(416, 'RangeNotSatisfiableError')
export const ExpectationFailedError = createError(417, 'ExpectationFailedError')
export const MisdirectedRequestError = createError(421, 'MisdirectedRequestError')
export const UnprocessableEntityError = createError(422, 'UnprocessableEntityError')
export const LockedError = createError(423, 'LockedError')
export const FailedDependencyError = createError(424, 'FailedDependencyError')
export const TooEarlyError = createError(425, 'TooEarlyError')
export const UpgradeRequiredError = createError(426, 'UpgradeRequiredError')
export const PreconditionRequiredError = createError(428, 'PreconditionRequiredError')
export const TooManyRequestsError = createError(429, 'TooManyRequestsError')
export const RequestHeaderFieldsTooLargeError = createError(431, 'RequestHeaderFieldsTooLargeError')
export const UnavailableForLegalReasonsError = createError(451, 'UnavailableForLegalReasonsError')

// 5xx errors
export const NotImplementedError = createError(501, 'NotImplementedError')
