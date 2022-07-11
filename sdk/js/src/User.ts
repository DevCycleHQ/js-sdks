import { DVCOptions, DVCUser, JSON } from './types'
import { v4 as uuidv4 } from 'uuid'
import * as packageJson from '../package.json'
import UAParser from 'ua-parser-js'

export class DVCPopulatedUser implements DVCUser {
    isAnonymous: boolean
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: JSON
    privateCustomData?: JSON
    lastSeenDate: Date
    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly deviceModel: string
    readonly sdkType: 'client' | 'server'
    readonly sdkVersion: string

    constructor(user: DVCUser, options: DVCOptions) {
        if (!user.user_id && !user.isAnonymous) {
            throw new Error('Must have a user_id, or have "isAnonymous" set on the user')
        }

        this.user_id = !user.user_id ? uuidv4() : user.user_id
        this.isAnonymous = user.user_id ? false : user.isAnonymous
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

        const userAgent = new UAParser(typeof window !== "undefined" ? window.navigator.userAgent : undefined)
        const platformVersion = userAgent.getBrowser().name &&
             `${userAgent.getBrowser().name} ${userAgent.getBrowser().version}`

        this.createdDate = new Date()
        this.platform = options?.reactNative ? 'ReactNative' : 'web'
        this.platformVersion = platformVersion ?? 'unknown'
        this.deviceModel = options?.reactNative && globalThis.DeviceInfo
            ? globalThis.DeviceInfo.getModel() : typeof window !== "undefined" 
            ? window.navigator.userAgent : 'SSR - unknown'
        this.sdkType = 'client'
        this.sdkVersion = packageJson.version
    }

    updateUser(user: DVCUser): DVCPopulatedUser {
        if (this.user_id !== user.user_id) {
            throw new Error('Cannot update a user with a different user_id')
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

        return this
    }
}

