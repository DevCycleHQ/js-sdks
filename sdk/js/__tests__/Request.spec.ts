global.fetch = jest.fn()
import { DVCPopulatedUser } from '../src/User'
import * as Request from '../src/Request'
import { BucketedUserConfig } from '@devcycle/types'
import { dvcDefaultLogger } from '../src/logger'
const defaultLogger = dvcDefaultLogger({ level: 'debug' })
const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>
import { Response } from 'cross-fetch'
describe('Request tests', () => {
    beforeEach(() => {
        fetchRequestMock.mockClear()
        fetchRequestMock.mockResolvedValue(
            new Response(JSON.stringify({}), {
                status: 200,
            }),
        )
    })

    describe('getConfigJson', () => {
        it('should call get with serialized user and SDK key in params', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            await Request.getConfigJson(
                sdkKey,
                user as DVCPopulatedUser,
                defaultLogger,
                { sdkPlatform: 'js' },
                {
                    sse: true,
                    lastModified: 1234,
                    etag: 'etag',
                },
            )

            expect(fetchRequestMock).toBeCalledWith(
                'https://sdk-api.devcycle.com/v1/sdkConfig?sdkKey=' +
                    `${sdkKey}&user_id=${user.user_id}&isAnonymous=false&sse=1` +
                    `&sseLastModified=1234&sseEtag=etag&sdkPlatform=js`,
                expect.objectContaining({
                    headers: { 'Content-Type': 'application/json' },
                    method: 'GET',
                }),
            )
        })

        it('should call local proxy for apiProxyURL option', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            const dvcOptions = { apiProxyURL: 'http://localhost:4000' }
            await Request.getConfigJson(
                sdkKey,
                user as DVCPopulatedUser,
                defaultLogger,
                dvcOptions,
            )

            expect(fetchRequestMock).toBeCalledWith(
                `${dvcOptions.apiProxyURL}/v1/sdkConfig?sdkKey=` +
                    `${sdkKey}&user_id=${user.user_id}&isAnonymous=false`,
                expect.objectContaining({
                    headers: { 'Content-Type': 'application/json' },
                    method: 'GET',
                }),
            )
        })

        it('should call get with obfuscate param', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            fetchRequestMock.mockResolvedValue(
                new Response('{}', {
                    status: 200,
                }),
            )

            await Request.getConfigJson(
                sdkKey,
                user as DVCPopulatedUser,
                defaultLogger,
                { enableObfuscation: true },
                {
                    sse: true,
                    lastModified: 1234,
                    etag: 'etag',
                },
            )

            expect(fetchRequestMock).toBeCalledWith(
                'https://sdk-api.devcycle.com/v1/sdkConfig?sdkKey=' +
                    `${sdkKey}&user_id=${user.user_id}` +
                    '&isAnonymous=false&sse=1&sseLastModified=1234&sseEtag=etag&obfuscated=1',
                expect.objectContaining({
                    headers: { 'Content-Type': 'application/json' },
                    method: 'GET',
                }),
            )
        })
    })

    describe('publishEvents', () => {
        it('should call get with serialized user and SDK key in params', async () => {
            const user = { user_id: 'my_user' } as DVCPopulatedUser
            const config = {} as BucketedUserConfig
            const sdkKey = 'my_sdk_key'
            const events = [{ type: 'event_1_type' }, { type: 'event_2_type' }]
            fetchRequestMock.mockResolvedValue(
                new Response('{}', {
                    status: 200,
                }),
            )

            await Request.publishEvents(
                sdkKey,
                config,
                user,
                events,
                defaultLogger,
                {},
            )

            const call = fetchRequestMock.mock.calls[0]
            const requestBody = JSON.parse(call[1]?.body as string)

            expect(requestBody).toEqual({
                events: [
                    expect.objectContaining({
                        customType: 'event_1_type',
                        type: 'customEvent',
                        user_id: 'my_user',
                        clientDate: expect.any(Number),
                    }),
                    expect.objectContaining({
                        customType: 'event_2_type',
                        type: 'customEvent',
                        user_id: 'my_user',
                        clientDate: expect.any(Number),
                    }),
                ],
                user,
            })
        })

        it('should call with obfuscation param', async () => {
            const user = { user_id: 'my_user' } as DVCPopulatedUser
            const config = {} as BucketedUserConfig
            const sdkKey = 'my_sdk_key'
            const events = [{ type: 'event_1_type' }, { type: 'event_2_type' }]
            fetchRequestMock.mockResolvedValue(
                new Response(JSON.stringify('messages'), {
                    status: 200,
                }),
            )

            await Request.publishEvents(
                sdkKey,
                config,
                user,
                events,
                defaultLogger,
                { enableObfuscation: true },
            )

            expect(fetchRequestMock).toBeCalledWith(
                'https://events.devcycle.com/v1/events?obfuscated=1',
                expect.objectContaining({
                    headers: {
                        Authorization: 'my_sdk_key',
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                }),
            )
        })
    })

    describe('saveEntity', () => {
        it('should send user data to edgedb api with url-encoded id', async () => {
            const user = { user_id: 'user@example.com', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            fetchRequestMock.mockResolvedValue(
                new Response('{}', {
                    status: 200,
                }),
            )

            await Request.saveEntity(
                user as DVCPopulatedUser,
                sdkKey,
                defaultLogger,
            )
            const call = fetchRequestMock.mock.calls[0]
            const requestBody = JSON.parse(call[1]?.body as string)
            expect(requestBody).toEqual({
                user_id: 'user@example.com',
                isAnonymous: false,
            })
            expect(fetchRequestMock).toBeCalledWith(
                'https://sdk-api.devcycle.com/v1/edgedb/user%40example.com',
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'my_sdk_key',
                    },
                    method: 'PATCH',
                }),
            )
        })
    })
})
