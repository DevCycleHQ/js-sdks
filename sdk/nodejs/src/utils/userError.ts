export class UserError extends Error {
  constructor(error: Error | string) {
    super(error instanceof Error ? error.message : error)
    this.name = 'UserError'
    this.stack = error instanceof Error ? error.stack : undefined
  }
}
