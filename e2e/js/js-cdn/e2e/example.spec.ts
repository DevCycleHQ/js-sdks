import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
    console.log('Starting test')
    await page.goto('/')
    console.log('went to page')
    // Expect h1 to contain a substring.
    expect(await page.locator('h1').innerText()).toContain('Welcome')
    console.log('expected')
})
