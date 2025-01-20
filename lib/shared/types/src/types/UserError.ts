export class UserError extends Error {
    constructor(error: Error | string) {
        super(error instanceof Error ? error.message : error)
        this.name = 'UserError'
        if (error instanceof Error) {
            this.stack = error.stack
        }
    }
}
