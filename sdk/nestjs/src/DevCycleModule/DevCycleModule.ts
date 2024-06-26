import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { initializeDevCycle, DevCycleClient } from '@devcycle/nodejs-server-sdk'
import { ClsModule } from 'nestjs-cls'

import {
    ConfigurableModuleClass,
    DevCycleModuleOptions,
    MODULE_OPTIONS_TOKEN,
} from './DevCycleModuleOptions'
import { RequestInterceptor } from './RequestInterceptor'
import { DevCycleService } from './DevCycleService'

@Module({
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true },
        }),
    ],
    exports: [DevCycleClient, DevCycleService],
    providers: [
        DevCycleService,
        {
            provide: DevCycleClient,
            useFactory: createClient,
            inject: [MODULE_OPTIONS_TOKEN],
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestInterceptor,
        },
    ],
})
export class DevCycleModule extends ConfigurableModuleClass {}

function createClient({
    key,
    options,
}: DevCycleModuleOptions): Promise<DevCycleClient> {
    return initializeDevCycle(key, {
        ...options,
        enableCloudBucketing: false,
    }).onClientInitialized()
}
