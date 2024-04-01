import { ExecutionContext } from '@nestjs/common'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'

export interface RequestWithData {
    [key: string]: any
    get dvc_client(): DevCycleClient
    get dvc_user(): DevCycleUser
}

export const getRequestFromContext = (
    context: ExecutionContext,
): RequestWithData => {
    return context.switchToHttp().getRequest()
}
