import { DVCCustomDataJSON } from '@devcycle/types'
import { checkParamType, typeEnum } from '../utils/paramUtils'

type DevCycleUserData = {
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: DVCCustomDataJSON
    privateCustomData?: DVCCustomDataJSON
}

export class DevCycleUser {
    /**
     * Identifies the current user. Must be defined
     */
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    name?: string

    /**
     * ISO 639-1 two-letter codes, or ISO 639-2 three-letter codes
     */
    language?: string

    /**
     * ISO 3166 two or three-letter codes
     */
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    customData?: DVCCustomDataJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    privateCustomData?: DVCCustomDataJSON

    constructor(data: DevCycleUserData) {
        if (!data.user_id) {
            throw new Error('Must have a user_id set on the user')
        }
        checkParamType('user_id', data.user_id, typeEnum.string)
        if (data.user_id.length > 200) {
            throw new Error('user_id cannot be longer than 200 characters')
        }

        this.user_id = data.user_id
        this.email = data.email
        this.name = data.name
        this.language = data.language
        this.country = data.country
        this.appVersion = data.appVersion
        this.appBuild = data.appBuild
        this.customData = data.customData
        this.privateCustomData = data.privateCustomData
    }
}
