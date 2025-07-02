import { createParamDecorator } from '@nestjs/common'
import {
    DVCVariableValue,
    DevCycleClient,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { ClsServiceManager } from 'nestjs-cls'
import { VariableDefinitions } from '@devcycle/types'

export type VariableValueData<
    K extends keyof VariableDefinitions,
    T extends VariableDefinitions = VariableDefinitions,
> = {
    key: K extends string ? K : never
    default: T extends DVCVariableValue & VariableDefinitions[K]
        ? DVCVariableValue
        : never
}

export const VariableValue = createParamDecorator(
    (data: VariableValueData<keyof VariableDefinitions>) => {
        const cls = ClsServiceManager.getClsService()

        const client = cls.get('dvc_client') as DevCycleClient | undefined
        const user = cls.get('dvc_user') as DevCycleUser | undefined

        if (!client || !user) {
            throw new Error(
                'Missing DevCycle context. Is the DevCycleModule imported?',
            )
        }

        return client.variableValue(user, data.key, data.default)
    },
)
