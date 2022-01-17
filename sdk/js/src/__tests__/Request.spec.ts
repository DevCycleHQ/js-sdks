jest.mock('axios')
import axios from 'axios'
import { mocked } from 'ts-jest/utils'

const axiosRequestMock = jest.fn()
const createMock = mocked(axios.create, true)
// @ts-ignore
createMock.mockImplementation(() => ({
    request: axiosRequestMock,
    // @ts-ignore
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
}))

import * as Request from '../Request'

describe('Request tests', () => {
    beforeEach(() => {
        axiosRequestMock.mockReset()
    })

    describe('baseRequestParams', () => {
        const { baseRequestHeaders } = Request
        it('should add environmentKey header if passed in', () => {
            const params = baseRequestHeaders('my_env_key')
            expect(params['Content-Type']).toBe('application/json')
            expect(params['Authorization']).toBe('my_env_key')
        })

        it('should not add header if no environmentKey passed in', () => {
            const params = baseRequestHeaders()
            expect(params['Content-Type']).toBe('application/json')
            expect(params['Authorization']).toBeUndefined()
        })
    })

    describe('getConfigJson', () => {
        it('should call get with serialized user and environment key in params', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const environmentKey = 'my_env_key'
            axiosRequestMock.mockResolvedValue({ status: 200, data: {} })

            await Request.getConfigJson(environmentKey, user)

            expect(axiosRequestMock).toBeCalledWith({
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'GET',
                url: `https://sdk-api.devcycle.com/v1/sdkConfig?envKey=${environmentKey}&user_id=${user.user_id}&isAnonymous=false`
            })
        })
    })

    describe('publishEvents', () => {

        it('should call get with serialized user and environment key in params', async () => {
            const user = { user_id: 'my_user' }
            const config = {}
            const environmentKey = 'my_env_key'
            const events = [{ type: 'event_1_type' }, { type: 'event_2_type' }]
            axiosRequestMock.mockResolvedValue({ status: 200, data: 'messages' })

            // @ts-ignore
            await Request.publishEvents(environmentKey, config, user, events)

            expect(axiosRequestMock).toBeCalledWith({
                headers: {
                    'Authorization': 'my_env_key',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                url: 'https://events.devcycle.com/v1/events',
                data: {
                    events: [
                        expect.objectContaining({
                            customType: 'event_1_type',
                            type: 'customEvent',
                            user_id: 'my_user',
                            clientDate: expect.any(Number)
                        }),
                        expect.objectContaining({
                            customType: 'event_2_type',
                            type: 'customEvent',
                            user_id: 'my_user',
                            clientDate: expect.any(Number)
                        })
                    ],
                    user
                }
            })
        })
    })
})
