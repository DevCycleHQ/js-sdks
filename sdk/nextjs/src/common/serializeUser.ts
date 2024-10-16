import type { DVCClientAPIUser } from '@devcycle/types'

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
