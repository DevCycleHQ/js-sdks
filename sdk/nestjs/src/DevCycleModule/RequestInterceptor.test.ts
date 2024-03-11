import { ExecutionContext, CallHandler } from '@nestjs/common'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'
import { RequestInterceptor } from './RequestInterceptor'

describe('RequestInterceptor', () => {
    let interceptor: RequestInterceptor
    let client: DevCycleClient
    let user: DevCycleUser
    let request: Request
    let context: ExecutionContext
    let next: CallHandler<unknown>

    beforeEach(() => {
        client = {} as DevCycleClient
        user = {} as DevCycleUser
        interceptor = new RequestInterceptor(client, {
            key: 'sdk_key',
            userFactory: () => user,
        })
        request = {} as Request
        context = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(request),
            }),
        } as unknown as ExecutionContext
        next = {
            handle: jest.fn(),
        } as CallHandler<unknown>
    })

    it('should call next.handle', async () => {
        await interceptor.intercept(context, next)
        expect(next.handle).toHaveBeenCalled()
    })

    it('should add dvc_client property to request', async () => {
        expect(request).not.toHaveProperty('dvc_client')
        await interceptor.intercept(context, next)
        expect(request).toHaveProperty('dvc_client', client)
    })

    it('should add dvc_user property to request', async () => {
        expect(request).not.toHaveProperty('dvc_user')
        await interceptor.intercept(context, next)
        expect(request).toHaveProperty('dvc_user', user)
    })
})
