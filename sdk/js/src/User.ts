import { DevCycleOptions, DevCycleUser, DVCCustomDataJSON } from './types'
import { v4 as uuidv4 } from 'uuid'
import packageJson from '../package.json'
import UAParser from 'ua-parser-js'

type StaticData = Pick<
    DVCPopulatedUser,
    | 'createdDate'
    | 'platform'
    | 'platformVersion'
    | 'deviceModel'
    | 'sdkType'
    | 'sdkVersion'
>

type PropertiesOnly<T> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends Function ? never : K
    }[keyof T]
>

export class DVCPopulatedUser implements DevCycleUser {
    readonly isAnonymous: boolean
    readonly user_id: string
    readonly email?: string
    readonly name?: string
    readonly language?: string
    readonly country?: string
    readonly appVersion?: string
    readonly appBuild?: number
    readonly customData?: DVCCustomDataJSON
    readonly privateCustomData?: DVCCustomDataJSON
    readonly lastSeenDate: Date

    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly deviceModel: string
    readonly sdkType: 'client'
    readonly sdkVersion: string

    constructor(
        user: DevCycleUser,
        options: DevCycleOptions,
        staticData?: StaticData,
        anonymousUserId?: string,
        headerUserAgent?: string,
    ) {
        if (user.user_id?.trim() === '') {
            throw new Error(
                'A User cannot be created with a user_id that is an empty string',
            )
        }

        this.user_id =
            user.isAnonymous || !user.user_id
                ? user.user_id || anonymousUserId || uuidv4()
                : user.user_id
        this.isAnonymous = user.isAnonymous || !user.user_id
        this.email = user.email
        this.name = user.name
        this.language = user.language
        this.country = user.country
        this.appVersion = user.appVersion
        this.appBuild = user.appBuild
        this.customData = user.customData
        this.privateCustomData = user.privateCustomData
        this.lastSeenDate = new Date()

        const userAgentString =
            typeof window !== 'undefined'
                ? window.navigator.userAgent
                : headerUserAgent

        /**
         * Read only properties initialized once
         */

        if (staticData) {
            Object.assign(this, staticData)
        } else {
            const userAgent = new UAParser(userAgentString)
            const platformVersion =
                userAgent.getBrowser().name &&
                `${userAgent.getBrowser().name} ${
                    userAgent.getBrowser().version
                }`

            this.createdDate = new Date()
            this.platform = options?.reactNative ? 'ReactNative' : 'web'
            this.platformVersion = platformVersion ?? 'unknown'
            this.deviceModel =
                options?.reactNative && globalThis.DeviceInfo
                    ? globalThis.DeviceInfo.getModel()
                    : userAgentString ?? 'SSR - unknown'
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

    updateUser(user: DevCycleUser, options: DevCycleOptions): DVCPopulatedUser {
        if (this.user_id !== user.user_id) {
            throw new Error('Cannot update a user with a different user_id')
        }

        return new DVCPopulatedUser(user, options, this.getStaticData())
    }

    toObject(): PropertiesOnly<DVCPopulatedUser> {
        return {
            isAnonymous: this.isAnonymous,
            user_id: this.user_id,
            email: this.email,
            name: this.name,
            language: this.language,
            country: this.country,
            appVersion: this.appVersion,
            appBuild: this.appBuild,
            customData: this.customData,
            privateCustomData: this.privateCustomData,
            lastSeenDate: this.lastSeenDate,
            createdDate: this.createdDate,
            platform: this.platform,
            platformVersion: this.platformVersion,
            deviceModel: this.deviceModel,
            sdkType: this.sdkType,
            sdkVersion: this.sdkVersion,
        }
    }
}
