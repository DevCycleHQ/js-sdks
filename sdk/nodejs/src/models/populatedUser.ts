import { DVCJSON } from '../types'
import * as packageJson from '../../package.json'
import { DVCUser } from './user'

export class DVCPopulatedUser implements DVCUser {
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: DVCJSON
    privateCustomData?: DVCJSON
    readonly lastSeenDate: Date
    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: 'server'
    readonly sdkVersion: string

    constructor(user: DVCUser) {
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

    static fromDVCUser(user: DVCUser): DVCPopulatedUser {
        return new DVCPopulatedUser(user)
    }
}
