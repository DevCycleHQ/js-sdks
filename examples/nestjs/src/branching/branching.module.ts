import { Injectable, Module } from '@nestjs/common'
import { BranchByVariable } from '@devcycle/nestjs-server-sdk'
import {
    DependenciesModule,
    Dependency1,
    Dependency2,
} from '../dependencies/dependencies.module'

export abstract class BranchedProvider {
    abstract hello(): void
}

@Injectable()
export class OldProvider implements BranchedProvider {
    constructor(private readonly dependency: Dependency1) {
        console.log('OldProvider initialized')
        this.dependency.honk()
    }

    hello(): void {
        console.log('hello')
    }
}

@Injectable()
export class NewProvider implements BranchedProvider {
    constructor(private readonly dependency: Dependency2) {
        console.log('OldProvider initialized')
        this.dependency.bark()
    }

    hello(): void {
        console.log('hello')
    }
}

@Module({
    imports: [DependenciesModule],
    providers: [
        BranchByVariable(
            'some-branch',
            BranchedProvider,
            OldProvider,
            NewProvider,
        ),
    ],
    exports: [BranchedProvider],
})
export class BranchingModule {}
