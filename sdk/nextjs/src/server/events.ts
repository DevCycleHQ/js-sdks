import { addTrackedEvent, getClient } from './requestContext'
import { DevCycleEvent } from '@devcycle/js-client-sdk'

export const trackEvent = (event: DevCycleEvent) => {
    const client = getClient()
    if (!client) {
        console.error('DevCycle client not initialized to track event!')
        return
    }
    addTrackedEvent(event)
}
