import { DevCycleClient, DevCycleUser } from '@devcycle/js-client-sdk'
import { createCookieContents } from '../common/cookie'

/**
 * Used on client side to update DevCycle cookie with latest user data when identify is called clientside
 * This cookie is sent with every request to the Next backend, allowing us to receive that user data serverside
 * and perform bucketing
 * @param client
 * @param user
 */
export const updateDVCCookie = (
    client: DevCycleClient,
    user?: DevCycleUser,
) => {
    if (typeof document === 'undefined') {
        return
    }
    document.cookie =
        'devcycle-next=' +
        createCookieContents(
            {
                user_id: user ? user.user_id : client.user!.user_id,
            },
            client.config?.lastModified,
        )
}
