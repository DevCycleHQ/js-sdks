import { cache } from 'react'

export const hasOptInEnabled = cache(
    async (userId: string, sdkKey: string): Promise<boolean> => {
        const response = await fetch(
            `https://sdk-api.devcycle.com/v1/optIns/${encodeURIComponent(
                userId,
            )}/hasEnabled`,
            {
                headers: {
                    Authorization: sdkKey,
                },
                next: {
                    revalidate: 3600,
                    tags: [`optin-${sdkKey}`],
                },
            },
        )
        const status = response.status
        if (status === 200) {
            return true
        } else if (status === 204) {
            return false
        } else {
            throw new Error(`Unexpected status code: ${status}`)
        }
    },
)
