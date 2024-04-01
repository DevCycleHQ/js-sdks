import { Inject, Injectable } from '@nestjs/common'
import {
    DVCVariableValue,
    DevCycleClient,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { RequestWithData } from './RequestWithData'
import { REQUEST } from '@nestjs/core'

@Injectable()
export class DevCycleService {
    constructor(
        private devcycleClient: DevCycleClient,
        @Inject(REQUEST) private readonly request: RequestWithData,
    ) {}

    getUser(): DevCycleUser {
        return this.request.dvc_user
    }

    isEnabled(key: string): boolean {
        return this.devcycleClient.variableValue(this.getUser(), key, false)
    }

    variableValue<T extends DVCVariableValue>(
        key: string,
        defaultValue: T,
    ): DVCVariableValue {
        return this.devcycleClient.variableValue(
            this.getUser(),
            key,
            defaultValue,
        )
    }
}
