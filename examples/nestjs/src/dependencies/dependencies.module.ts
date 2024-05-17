import { Injectable, Module } from '@nestjs/common'

@Injectable()
export class Dependency1 {
    constructor() {
        console.log('Dependency initialized')
    }

    honk() {
        console.log('honk')
    }
}

@Injectable()
export class Dependency2 {
    constructor() {
        console.log('Dependency initialized')
    }

    bark() {
        console.log('bark')
    }
}

@Module({
    providers: [Dependency1, Dependency2],
    exports: [Dependency1, Dependency2],
})
export class DependenciesModule {}
