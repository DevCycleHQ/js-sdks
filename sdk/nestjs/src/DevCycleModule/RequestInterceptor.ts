import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { DevCycleClient, DevCycleUser } from '@devcycle/nodejs-server-sdk'
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

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<ReturnType<CallHandler['handle']>> {
        this.cls.set('dvc_client', this.client)
        
        let user: DevCycleUser
        if (this.options.asyncUserFactory) {
            user = await this.options.asyncUserFactory(context)
        } else if (this.options.userFactory) {
            user = this.options.userFactory(context)
        } else {
            throw new Error('Either userFactory or asyncUserFactory must be provided')
        }
        
        this.cls.set('dvc_user', user)

        return next.handle()
    }
}
