import { DevCycleOptions, DevCycleUser, DVCCustomDataJSON } from './types'
import { CacheStore } from './CacheStore'
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
    | 'sdkPlatform'
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
    readonly sdkPlatform?: string

    private generateAndSaveAnonUserId(
        anonymousUserId?: string,
        store?: CacheStore,
    ): string {
        const userId = anonymousUserId || uuidv4()
        // Save newly generated anonymous user ID to storage
        if (!anonymousUserId && store) {
            void store.saveAnonUserId(userId)
        }
        return userId
    }

    constructor(
        user: DevCycleUser,
        options: DevCycleOptions,
        staticData?: StaticData,
        anonymousUserId?: string,
        headerUserAgent?: string,
        store?: CacheStore,
    ) {
        // Treat empty string user_id as null
        const normalizedUserId = user.user_id === '' ? undefined : user.user_id

        // Validate required fields
        if (user.isAnonymous === false && !normalizedUserId) {
            throw new Error(
                'A User cannot be created with isAnonymous: false without a valid user_id',
            )
        }

        // Set user_id and isAnonymous based on the input
        if (user.isAnonymous === true) {
            // Case: { isAnonymous: true } or { user_id: 'abc', isAnonymous: true }
            this.user_id =
                normalizedUserId ||
                this.generateAndSaveAnonUserId(anonymousUserId, store)
            this.isAnonymous = true
        } else if (!normalizedUserId) {
            // Case: {} (empty object) - set as anonymous
            this.user_id = this.generateAndSaveAnonUserId(
                anonymousUserId,
                store,
            )
            this.isAnonymous = true
        } else {
            // Case: { user_id: 'abc' } or { user_id: 'abc', isAnonymous: false }
            this.user_id = normalizedUserId
            this.isAnonymous = user.isAnonymous ?? false
        }
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
            this.sdkPlatform = options?.sdkPlatform
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
            sdkPlatform: this.sdkPlatform,
        }
    }

    updateUser(user: DevCycleUser, options: DevCycleOptions): DVCPopulatedUser {
        if (this.user_id !== user.user_id) {
            throw new Error('Cannot update a user with a different user_id')
        }

        return new DVCPopulatedUser(user, options, this.getStaticData())
    }
}
