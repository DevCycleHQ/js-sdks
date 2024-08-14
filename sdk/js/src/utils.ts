import { DevCycleEvent } from './types'
import { DVCRequestEvent } from './RequestEvent'
import { DVCPopulatedUser } from './User'
import type {
    BucketedUserConfig,
    SDKEventRequestBody,
    DVCClientAPIUser,
} from '@devcycle/types'

const convertToQueryFriendlyFormat = (property?: any): any => {
    if (property instanceof Date) {
        return property.getTime()
    }
    if (typeof property === 'object') {
        return JSON.stringify(property)
    }
    return property
}

export const serializeUserSearchParams = (
    user: DVCClientAPIUser,
    queryParams: URLSearchParams,
): void => {
    for (const key in user) {
        const userProperty = convertToQueryFriendlyFormat(
            user[key as keyof DVCClientAPIUser],
        )
        if (userProperty !== null && userProperty !== undefined) {
            queryParams.append(key, userProperty)
        }
    }
}

export const checkParamDefined = (name: string, param: unknown): void => {
    if (!checkIfDefined(param)) {
        throw new Error(`Missing parameter: ${name}`)
    }
}

export const checkIfDefined = (variable: unknown): boolean => {
    if (variable === undefined || variable === null) {
        return false
    }
    return true
}

export const checkParamType = (
    name: string,
    param: unknown,
    type: string,
): void => {
    if (!param) {
        throw new Error(`Missing parameter: ${name}`)
    }
    if (typeof param !== type) {
        throw new Error(`${name} is not of type ${type}`)
    }
}

export function generateEventPayload(
    config: BucketedUserConfig | null,
    user: DVCPopulatedUser,
    events: DevCycleEvent[],
): SDKEventRequestBody {
    return {
        events: events.map((event) => {
            return new DVCRequestEvent(
                event,
                user.user_id,
                config?.featureVariationMap,
            )
        }),
        user,
    }
}

// The `self` property is available only in WorkerScope environments (which don't have access to window)
// ServiceWorkerGlobalScope is the name of the class when in a service worker environment
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope
// https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/self
//
export function checkIsServiceWorker(): boolean {
    return (
        typeof self !== 'undefined' &&
        self.constructor &&
        self.constructor.name === 'ServiceWorkerGlobalScope'
    )
}

export default {
    serializeUserSearchParams,
    checkParamDefined,
    generateEventPayload,
}
