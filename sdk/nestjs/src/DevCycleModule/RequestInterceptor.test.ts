import { ExecutionContext, CallHandler } from '@nestjs/common'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'
import { RequestInterceptor } from './RequestInterceptor'
import { ClsService } from 'nestjs-cls'

describe('RequestInterceptor', () => {
    let interceptor: RequestInterceptor
    let client: DevCycleClient
    let user: DevCycleUser
    let cls: ClsService
    let request: Request
    let context: ExecutionContext
    let next: CallHandler<unknown>

    beforeEach(() => {
        client = {} as DevCycleClient
        user = {} as DevCycleUser
        cls = { get: jest.fn(), set: jest.fn() } as unknown as ClsService
        interceptor = new RequestInterceptor(
            client,
            {
                key: 'sdk_key',
                userFactory: () => user,
            },
            cls,
        )
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

    it('should add dvc_client property to cls', async () => {
        await interceptor.intercept(context, next)
        expect(cls.set).toHaveBeenCalledWith('dvc_client', client)
    })

    it('should add dvc_user property to cls', async () => {
        await interceptor.intercept(context, next)
        expect(cls.set).toHaveBeenCalledWith('dvc_user', user)
    })
})
