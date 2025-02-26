import { Injectable } from '@nestjs/common'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'
import {
    InferredVariableType,
    VariableDefinitions,
    VariableKey,
} from '@devcycle/types'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class DevCycleService {
    constructor(
        private readonly devcycleClient: DevCycleClient,
        private readonly cls: ClsService,
    ) {}

    getUser(): DevCycleUser {
        const user = this.cls.get('dvc_user')
        if (!user) {
            throw new Error(
                'Missing user context. Is the DevCycleModule imported and a user factory set?',
            )
        }
        return user
    }

    isEnabled(key: VariableKey): boolean {
        return this.devcycleClient.variableValue(this.getUser(), key, false)
    }

    variableValue<
        K extends VariableKey,
        ValueType extends VariableDefinitions[K],
    >(key: K, defaultValue: ValueType): InferredVariableType<K, ValueType> {
        return this.devcycleClient.variableValue(
            this.getUser(),
            key,
            defaultValue,
        )
    }
}
