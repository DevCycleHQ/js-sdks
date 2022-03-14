import { DVCUser, JSON } from '../../types'
import * as packageJson from '../../package.json'
import { checkParamType, typeEnum } from '../utils/paramUtils'

type UserParam = Pick<DVCRequestUser,
    'user_id' | 'email' | 'name' | 'language' |
    'country' | 'appVersion' | 'appBuild' | 'customData' | 'privateCustomData'
>

export class DVCRequestUser implements DVCUser {
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: JSON
    privateCustomData?: JSON
    readonly lastSeenDate: Date
    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: 'server'
    readonly sdkVersion: string

    constructor(user: UserParam) {
        if (!user.user_id) {
            throw new Error('Must have a user_id set on the user')
        }
        checkParamType('user_id', user.user_id, typeEnum.string)

        this.user_id = user.user_id
        this.email = user.email
        this.name = user.name
        this.language = user.language
        this.country = user.country
        this.appVersion = user.appVersion
        this.appBuild = user.appBuild
        this.customData = user.customData
        this.privateCustomData = user.privateCustomData
        this.lastSeenDate = new Date()

        /**
         * Read only properties initialized once
         */
        this.createdDate = new Date()
        this.platform = 'NodeJS'
        this.platformVersion = process.version
        this.sdkType = 'server'
        this.sdkVersion = packageJson.version
    }
}
