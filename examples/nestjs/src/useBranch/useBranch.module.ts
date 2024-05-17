import { Module } from '@nestjs/common'
import { UseBranchController } from './useBranch.controller'
import { BranchingModule } from '../branching/branching.module'

@Module({
    imports: [BranchingModule],
    providers: [],
    controllers: [UseBranchController],
    exports: [],
})
export class UseBranchModule {}
