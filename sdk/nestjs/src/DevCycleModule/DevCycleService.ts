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
        return this.cls.get('dvc_user')
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
