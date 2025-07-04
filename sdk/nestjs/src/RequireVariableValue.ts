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
import { ClsService } from 'nestjs-cls'
import { VariableDefinitions, VariableKey } from '@devcycle/types'

type VariableValues<
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
> = {
    [key in K]: ValueType
}

export const RequireVariableValue = (
    requiredVariables: VariableValues<VariableKey, DVCVariableValue>,
): ClassDecorator & MethodDecorator =>
    applyDecorators(
        UseInterceptors(RequireVariableValueInterceptor(requiredVariables)),
    )

const RequireVariableValueInterceptor = (
    requiredVariableValues: VariableValues<VariableKey, DVCVariableValue>,
) => {
    class RequireVariableValueInterceptor implements NestInterceptor {
        constructor(
            @Inject(DevCycleClient) readonly dvcClient: DevCycleClient,
            private readonly cls: ClsService,
        ) {}

        async intercept(context: ExecutionContext, next: CallHandler) {
            const req = context.switchToHttp().getRequest()
            const user = this.cls.get('dvc_user')

            if (!user) {
                throw new Error(
                    'Missing user context. Is the DevCycleModule imported?',
                )
            }

            for (const [key, requiredValue] of Object.entries(
                requiredVariableValues,
            )) {
                const defaultValue = getDefaultValue(
                    requiredValue as DVCVariableValue,
                )
                const { value: servedValue, isDefaulted } =
                    this.dvcClient.variable(user, key, defaultValue)

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
