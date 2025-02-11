import { DVCCustomDataJSON } from '../types'
import * as packageJson from '../../package.json'
import { DevCycleUser } from './user'
import { SDKTypes } from '@devcycle/types'

export type DevCyclePlatformDetails = {
    platform?: string
    platformVersion?: string
    sdkType?: SDKTypes
    sdkVersion?: string
    sdkPlatform?: string
    hostname?: string
}

export class DVCPopulatedUser implements DevCycleUser {
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: DVCCustomDataJSON
    privateCustomData?: DVCCustomDataJSON
    readonly lastSeenDate: Date
    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: SDKTypes
    readonly sdkVersion: string
    readonly sdkPlatform?: string
    readonly hostname?: string

    constructor(user: DevCycleUser, platformDetails: DevCyclePlatformDetails) {
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
        this.platform = platformDetails?.platform || 'NodeJS'
        this.platformVersion = platformDetails?.platformVersion || ''
        this.sdkType = platformDetails?.sdkType || 'server'
        this.sdkVersion = platformDetails?.sdkVersion || packageJson.version
        this.sdkPlatform = platformDetails?.sdkPlatform
        this.hostname = platformDetails?.hostname
    }

    static fromDVCUser(
        user: DevCycleUser,
        platformDetails: DevCyclePlatformDetails,
    ): DVCPopulatedUser {
        return new DVCPopulatedUser(user, platformDetails)
    }
}
