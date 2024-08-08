import { Injectable } from '@nestjs/common'
import {
    DVCVariableValue,
    DevCycleClient,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { VariableTypeAlias } from '@devcycle/types'
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

    isEnabled(key: string): boolean {
        return this.devcycleClient.variableValue(this.getUser(), key, false)
    }

    variableValue<T extends DVCVariableValue>(
        key: string,
        defaultValue: T,
    ): VariableTypeAlias<T> {
        return this.devcycleClient.variableValue(
            this.getUser(),
            key,
            defaultValue,
        )
    }
}
