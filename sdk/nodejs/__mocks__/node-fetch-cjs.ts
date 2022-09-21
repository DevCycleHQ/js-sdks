const { Request, Response } = jest.requireActual('node-fetch-cjs')

const fetch = jest.fn()

export { Request, Response }
export default fetch
