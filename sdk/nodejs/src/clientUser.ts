import { DVCPopulatedUser, DevCycleUser } from '@devcycle/js-client-sdk'

export const generateClientPopulatedUser = (
    user: DevCycleUser,
    userAgent: string,
): DVCPopulatedUser => {
    return new DVCPopulatedUser(
        user,
        {},
        undefined,
        undefined,
        userAgent ?? undefined,
    )
}
