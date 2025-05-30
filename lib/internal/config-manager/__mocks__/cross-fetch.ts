const { Request, Response } = jest.requireActual('cross-fetch')

const fetch = jest.fn()

export { Request, Response }
export default fetch
