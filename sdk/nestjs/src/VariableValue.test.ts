import { ExecutionContext } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'
import { VariableValue } from './VariableValue'

function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
    class Test {
        // eslint-disable-next-line
        public test(@decorator() value: unknown) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test')
    return args[Object.keys(args)[0]].factory
}

describe('VariableValue', () => {
    let ctx: ExecutionContext
    let dvcClient: DevCycleClient
    let dvcUser: DevCycleUser

    beforeEach(() => {
        dvcClient = {
            variableValue: jest.fn().mockResolvedValue('variable value'),
        } as unknown as DevCycleClient
        dvcUser = { user_id: 'foo' }
        ctx = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    dvc_client: dvcClient,
                    dvc_user: dvcUser,
                }),
            }),
        } as unknown as ExecutionContext
    })

    it('calls variableValue on the devcycle client', () => {
        const key = 'myVariable'
        const defaultValue = 'default value'

        const factory = getParamDecoratorFactory(VariableValue)
        const value = factory({ key, default: defaultValue }, ctx)

        expect(dvcClient.variableValue).toBeCalledWith(
            dvcUser,
            key,
            defaultValue,
        )
        expect(value).resolves.toBe('variable value')
    })
})
