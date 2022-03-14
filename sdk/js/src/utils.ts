import { DVCEvent } from './types'
import { DVCRequestEvent } from './RequestEvent'
import { DVCUser } from './User'
import { BucketedUserConfig, SDKEventRequestBody, DVCClientAPIUser } from '@devcycle/types'

export const serializeUser = (user: DVCClientAPIUser): string => {
    const convertToQueryFriendlyFormat = (property?: any): any => {
        if (property instanceof Date) {
            return property.getTime()
        }
        if (typeof property === 'object') {
            return JSON.stringify(property)
        }
        return property
    }
    return Object.keys(user)
        .reduce((prev: string, curr: string, _: number): string => {
            const userProperty = convertToQueryFriendlyFormat(user[curr as keyof DVCClientAPIUser])
            const nextQueryParam = userProperty !== null && userProperty !== undefined
                ? `${prev && '&'}${curr}=${encodeURIComponent(userProperty)}`
                : ''
            return `${prev}${nextQueryParam}`
        }, '')
}

export const checkParamDefined = (name: string, param: any) => {
    if (param === undefined || param === null) {
        throw new Error(`Missing parameter: ${name}`)
    }
}

export const checkParamType = (name: string, param: any, type: string) => {
    if (!param) {
        throw new Error(`Missing parameter: ${name}`)
    }
    if (typeof param !== type) {
        throw new Error(`${name} is not of type ${type}`)
    }
}

export function generateEventPayload(
    config: BucketedUserConfig,
    user: DVCUser,
    events: DVCEvent[]
): SDKEventRequestBody {
    return {
        events: events.map((event) => {
            return new DVCRequestEvent(event, user.user_id, config.featureVariationMap)
        }),
        user
    }
}

export default {
    serializeUser,
    checkParamDefined,
    generateEventPayload
}
