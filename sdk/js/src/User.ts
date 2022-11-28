import { DVCOptions, DVCUser, DVCJSON } from './types'
import { v4 as uuidv4 } from 'uuid'
import * as packageJson from '../package.json'
import UAParser from 'ua-parser-js'

type StaticData = Pick<DVCPopulatedUser, 'createdDate' | 'platform' |
    'platformVersion' | 'deviceModel' | 'sdkType' | 'sdkVersion'>

export class DVCPopulatedUser implements DVCUser {
    readonly isAnonymous: boolean
    readonly user_id: string
    readonly email?: string
    readonly name?: string
    readonly language?: string
    readonly country?: string
    readonly appVersion?: string
    readonly appBuild?: number
    readonly customData?: DVCJSON
    readonly privateCustomData?: DVCJSON
    readonly lastSeenDate: Date

    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly deviceModel: string
    readonly sdkType: 'client'
    readonly sdkVersion: string

    constructor(user: DVCUser, options: DVCOptions, staticData?: StaticData, anonymousUserId?: string) {
        if (user.user_id?.trim() === '') {
            throw new Error('A User cannot be created with a user_id that is an empty string')
        }

        this.user_id = (user.isAnonymous || !user.user_id) ?
            (user.user_id || anonymousUserId || uuidv4()) :
            user.user_id
        this.isAnonymous = (user.isAnonymous || !user.user_id)
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

        if (staticData) {
            Object.assign(this, staticData)
        } else {
            const userAgent = new UAParser(typeof window !== 'undefined' ? window.navigator.userAgent : undefined)
            const platformVersion = userAgent.getBrowser().name &&
                `${userAgent.getBrowser().name} ${userAgent.getBrowser().version}`

            this.createdDate = new Date()
            this.platform = options?.reactNative ? 'ReactNative' : 'web'
            this.platformVersion = platformVersion ?? 'unknown'
            this.deviceModel = options?.reactNative && globalThis.DeviceInfo
                ? globalThis.DeviceInfo.getModel() : typeof window !== 'undefined'
                    ? window.navigator.userAgent : 'SSR - unknown'
            this.sdkType = 'client'
            this.sdkVersion = packageJson.version
        }
    }

    getStaticData(): StaticData {
        return {
            createdDate: this.createdDate,
            platform: this.platform,
            platformVersion: this.platformVersion,
            deviceModel: this.deviceModel,
            sdkType: this.sdkType,
            sdkVersion: this.sdkVersion,
        }
    }

    updateUser(user: DVCUser, options: DVCOptions): DVCPopulatedUser {
        if (this.user_id !== user.user_id) {
            throw new Error('Cannot update a user with a different user_id')
        }

        return new DVCPopulatedUser(user, options, this.getStaticData())
    }
}

