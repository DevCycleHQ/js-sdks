import { test, expect } from '@playwright/test'

test('basic page load and console log check', async ({ page }) => {
    // page.on('console', (msg) => {
    //     const type = msg.type().toUpperCase()
    //     const text = msg.text()
    //     console.log(`[Browser Console] ${type}: ${text}`)
    // })

    // page.on('load', () =>
    //     console.log('[Playwright Test] Page load event fired.'),
    // )
    // page.on('domcontentloaded', () =>
    //     console.log('[Playwright Test] DOMContentLoaded event fired.'),
    // )
    // page.on('pageerror', (error) =>
    //     console.error(`[Browser Page Error] ${error.message}`),
    // )

    const response = await page.goto('/', {
        timeout: 30000, // Keep a reasonable timeout
        waitUntil: 'domcontentloaded',
    })
    expect(response?.status()).toBe(200) // Check for successful page load

    // Add a simple expectation
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })

    // Verify the custom element is present and has content
    const appRoot = page.locator('devcycle-root')
    await expect(appRoot).toBeVisible()
    await expect(appRoot).not.toContainText('Error', { timeout: 5000 }) // Check for no init errors
    await expect(appRoot.locator('#variableKey')).toContainText(
        'JS Web Elements',
    )
})
