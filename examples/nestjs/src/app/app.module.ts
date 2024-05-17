import { Injectable, Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DevCycleModule } from '@devcycle/nestjs-server-sdk'
import { BranchingModule } from '../branching/branching.module'
import { UseBranchModule } from '../useBranch/useBranch.module'

@Module({
    imports: [
        DevCycleModule.forRoot({
            key: 'server-89e84aa8-cd0d-400e-83ff-3fd76b595579',
            isGlobal: true,
            userFactory: (context) => {
                return { user_id: 'test' }
            },
        }),
        UseBranchModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
