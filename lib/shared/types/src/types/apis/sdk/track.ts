import { DVCAPIUser } from './clientSDKAPI'
import { DVCEvent } from '../../entities/dvcEvent'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class SDKEventRequestBody {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => DVCAPIUser)
        user: DVCAPIUser

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DVCEvent)
        events: DVCEvent[]
}
