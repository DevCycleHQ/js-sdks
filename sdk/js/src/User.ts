import { DVCOptions, DVCUser as User, JSON } from './types'
import { v4 as uuidv4 } from 'uuid'

export type UserParam = Pick<User, 'isAnonymous' | 'user_id' | 'email' | 'name' | 'language' | 'country'
    | 'appVersion' | 'appBuild' | 'customData' | 'privateCustomData'>

export class DVCUser implements User {
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

    constructor(user: UserParam, options?: DVCOptions) {
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

        this.createdDate = new Date()
        this.platform = options?.reactNative ? 'ReactNative' : 'web'
        this.platformVersion = '1.0.9'
        this.deviceModel = options?.reactNative && globalThis.DeviceInfo
            ? globalThis.DeviceInfo.getModel()
            : window.navigator.userAgent
        this.sdkType = 'client'
        this.sdkVersion = '1.0.9'
    }

    updateUser(user: UserParam) {
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

