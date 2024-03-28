import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { DVCVariableValue } from '@devcycle/nodejs-server-sdk'
import { getRequestFromContext } from './DevCycleModule/RequestWithData'

type VariableValueData = {
    key: string
    default: DVCVariableValue
}

export const VariableValue = createParamDecorator(
    (data: VariableValueData, ctx: ExecutionContext) => {
        const req = getRequestFromContext(ctx)

        if (!req.dvc_client || !req.dvc_user) {
            throw new Error(
                'Missing DevCycle context. Is the DevCycleModule imported?',
            )
        }

        return req.dvc_client.variableValue(
            req.dvc_user,
            data.key,
            data.default,
        )
    },
)
