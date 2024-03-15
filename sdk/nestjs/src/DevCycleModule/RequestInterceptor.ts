import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { DevCycleClient } from '@devcycle/nodejs-server-sdk'
import {
    MODULE_OPTIONS_TOKEN,
    DevCycleModuleOptions,
} from './DevCycleModuleOptions'

@Injectable()
export class RequestInterceptor implements NestInterceptor {
    constructor(
        @Inject(DevCycleClient) private client: DevCycleClient,
        @Inject(MODULE_OPTIONS_TOKEN) private options: DevCycleModuleOptions,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): ReturnType<CallHandler['handle']> {
        const req = context.switchToHttp().getRequest()
        req.dvc_client = this.client
        req.dvc_user = this.options.userFactory(context)

        return next.handle()
    }
}
