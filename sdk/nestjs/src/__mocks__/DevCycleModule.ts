import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { DevCycleClient } from '@devcycle/nodejs-server-sdk'
import { MockDevCycleClient } from './DevCycleClient'
import { RequestInterceptor } from '../DevCycleModule/RequestInterceptor'
import { DevCycleService } from '../DevCycleModule/DevCycleService'
import {
    ConfigurableModuleClass,
    MODULE_OPTIONS_TOKEN,
} from '../DevCycleModule/DevCycleModuleOptions'

@Module({
    exports: [DevCycleClient, DevCycleService],
    providers: [
        DevCycleService,
        {
            provide: DevCycleClient,
            useFactory: ({ key, options }) =>
                new MockDevCycleClient(key, options),
            inject: [MODULE_OPTIONS_TOKEN],
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestInterceptor,
        },
    ],
})
export class DevCycleModule extends ConfigurableModuleClass {}

export * from '../DevCycleModule/DevCycleService'
