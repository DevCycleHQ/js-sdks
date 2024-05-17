import { ConfigurableModuleBuilder, ExecutionContext } from '@nestjs/common'
import { DevCycleOptions, DevCycleUser } from '@devcycle/nodejs-server-sdk'

export interface DevCycleModuleOptions {
    key: string
    options?: Omit<DevCycleOptions, 'enableCloudBucketing'>
    userFactory: (
        context: ExecutionContext,
    ) => DevCycleUser | Promise<DevCycleUser>
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
    new ConfigurableModuleBuilder<DevCycleModuleOptions>()
        .setClassMethodName('forRoot')
        .setExtras(
            {
                isGlobal: true, // default to global
            },
            (definition, extras) => ({
                ...definition,
                global: extras.isGlobal,
            }),
        )
        .build()
