import { DVCJSON } from '../types'
import * as packageJson from '../../package.json'
import { DVCUser } from './user'
import os from 'os'
import { DVCUser_PB, NullableCustomData, NullableDouble, NullableString } from '../pb-types/compiled'

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
    readonly hostname: string

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
        this.hostname = os.hostname()
    }

    toPBUser(): DVCUser_PB {
        const params = {
            user_id: this.user_id,
            email: NullableString.create({ value: this.email || '', isNull: !this.email }),
            name: NullableString.create({ value: this.name || '', isNull: !this.name }),
            language: NullableString.create({ value: this.language || '', isNull: !this.language }),
            country: NullableString.create({ value: this.country || '', isNull: !this.country }),
            appBuild: NullableDouble.create({
                value: this.appBuild || 0,
                isNull: this.appBuild === null || this.appBuild === undefined
            }),
            appVersion: NullableString.create({ value: this.appVersion || '', isNull: !this.appVersion }),
            deviceModel: NullableString.create({ value: '', isNull: true }),
            customData: NullableCustomData.create({
                value: this.customData || {},
                isNull: !this.customData
            }),
            privateCustomData: NullableCustomData.create({
                value: this.privateCustomData || {},
                isNull: !this.privateCustomData
            })
        }
        const err = DVCUser_PB.verify(params)
        if (err) throw new Error(`DVCUser protobuf verification error: ${err}`)

        return DVCUser_PB.create(params)
    }

    static fromDVCUser(user: DVCUser): DVCPopulatedUser {
        return new DVCPopulatedUser(user)
    }
}
