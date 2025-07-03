import { createParamDecorator } from '@nestjs/common'
import {
    DVCVariableValue,
    DevCycleClient,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { ClsServiceManager } from 'nestjs-cls'

type VariableValueData = {
    key: string
    default: DVCVariableValue
}

export const VariableValue = createParamDecorator((data: VariableValueData) => {
    const cls = ClsServiceManager.getClsService()

    const client = cls.get('dvc_client') as DevCycleClient | undefined
    const user = cls.get('dvc_user') as DevCycleUser | undefined

    if (!client || !user) {
        throw new Error(
            'Missing DevCycle context. Is the DevCycleModule imported?',
        )
    }

    return client.variableValue(user, data.key, data.default)
})
