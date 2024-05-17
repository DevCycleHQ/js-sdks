import { Controller, Get } from '@nestjs/common'
import { BranchedProvider } from '../branching/branching.module'

@Controller()
export class UseBranchController {
    constructor(private service: BranchedProvider) {}

    @Get('branch')
    branch() {
        this.service.hello()
        return { hello: true }
    }
}
