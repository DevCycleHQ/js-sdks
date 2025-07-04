import { createParamDecorator } from '@nestjs/common'
import {
    DVCVariableValue,
    DevCycleClient,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { ClsServiceManager } from 'nestjs-cls'
import { VariableDefinitions, VariableKey } from '@devcycle/types'

type VariableValueData<
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
> = {
    key: K
    default: ValueType
}

export const VariableValue = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    ...dataOrPipes: VariableValueData<K, ValueType>[]
): ParameterDecorator => {
    return createParamDecorator((data: VariableValueData<K, ValueType>) => {
        const cls = ClsServiceManager.getClsService()

        const client = cls.get('dvc_client') as DevCycleClient | undefined
        const user = cls.get('dvc_user') as DevCycleUser | undefined

        if (!client || !user) {
            throw new Error(
                'Missing DevCycle context. Is the DevCycleModule imported?',
            )
        }

        return client.variableValue(user, data.key, data.default)
    })(...dataOrPipes)
}
