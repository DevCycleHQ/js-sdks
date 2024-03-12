import { DVCPopulatedUser } from '@devcycle/js-client-sdk'
import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'

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
