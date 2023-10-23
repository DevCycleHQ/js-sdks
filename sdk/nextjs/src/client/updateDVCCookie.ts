import { DevCycleClient } from '@devcycle/js-client-sdk'
import { createCookieContents } from '../common/cookie'

export const updateDVCCookie = (client: DevCycleClient) => {
    console.log('UPDATING  COOKIE')
    if (typeof document === 'undefined') {
        return
    }
    document.cookie =
        'devcycle-next=' +
        createCookieContents(
            {
                user_id: client.user!.user_id,
            },
            client.config?.lastModified,
        )
}
