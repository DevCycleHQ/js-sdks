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
import { ClsService } from 'nestjs-cls'

@Injectable()
export class RequestInterceptor implements NestInterceptor {
    constructor(
        @Inject(DevCycleClient) private client: DevCycleClient,
        @Inject(MODULE_OPTIONS_TOKEN) private options: DevCycleModuleOptions,
        private readonly cls: ClsService,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): ReturnType<CallHandler['handle']> {
        console.log('calling interceptor!')
        this.cls.set('dvc_client', this.client)
        this.cls.set('dvc_user', this.options.userFactory(context))

        return next.handle()
    }
}
