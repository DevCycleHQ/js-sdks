import {
    CallHandler,
    ExecutionContext,
    Inject,
    NestInterceptor,
    NotFoundException,
    UseInterceptors,
    applyDecorators,
    mixin,
} from '@nestjs/common'
import { DVCVariableValue, DevCycleClient } from '@devcycle/nodejs-server-sdk'

type VariableValues = {
    [key: string]: DVCVariableValue
}

export const RequireVariableValue = (
    requiredVariables: VariableValues,
): ClassDecorator & MethodDecorator =>
    applyDecorators(
        UseInterceptors(RequireVariableValueInterceptor(requiredVariables)),
    )

const RequireVariableValueInterceptor = (
    requiredVariableValues: VariableValues,
) => {
    class RequireVariableValueInterceptor implements NestInterceptor {
        constructor(
            @Inject(DevCycleClient) readonly dvcClient: DevCycleClient,
        ) {}

        async intercept(context: ExecutionContext, next: CallHandler) {
            const req = context.switchToHttp().getRequest()

            if (!req.dvc_user) {
                throw new Error(
                    'Missing user context. Is the DevCycleModule imported?',
                )
            }

            for (const [key, requiredValue] of Object.entries(
                requiredVariableValues,
            )) {
                const defaultValue = getDefaultValue(requiredValue)
                const { value: servedValue, isDefaulted } =
                    this.dvcClient.variable(req.dvc_user, key, defaultValue)

                if (isDefaulted || servedValue !== requiredValue) {
                    throw new NotFoundException(
                        `Cannot ${req.method} ${req.url}`,
                    )
                }
            }

            return next.handle()
        }
    }

    return mixin(RequireVariableValueInterceptor)
}

function getDefaultValue(value: DVCVariableValue): DVCVariableValue {
    switch (typeof value) {
        case 'string':
            return ''
        case 'number':
            return 0
        case 'boolean':
            return false
        case 'object':
            return {}
        default:
            throw new Error(`Unexpected value of type: ${typeof value}`)
    }
}
