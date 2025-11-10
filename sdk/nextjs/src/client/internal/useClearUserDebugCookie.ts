import { useEffect, useRef } from 'react'
import { clearDebugUserCookie } from '../../common/actions'

export const useClearUserDebugCookie = (): void => {
    const hasClearedCookieRef = useRef(false)
    // Clear the debug user cookie on page refresh (not on client-side navigation) if it exists
    // This runs only on mount, which happens on refresh but not on client-side navigation
    useEffect(() => {
        if (!hasClearedCookieRef.current) {
            hasClearedCookieRef.current = true
            // Check if this is a page refresh vs client-side navigation
            // Using both the deprecated and modern Navigation API for compatibility
            const navEntries =
                window.performance?.getEntriesByType('navigation') || []
            const navEntry = navEntries[0] as
                | PerformanceNavigationTiming
                | undefined
            const isRefresh =
                window.performance?.navigation?.type === 1 ||
                navEntry?.type === 'reload'

            if (isRefresh) {
                clearDebugUserCookie()
            }
        }
    }, [])
}
