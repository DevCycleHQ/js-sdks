import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
    await page.goto('/')

    // Expect h1 to contain a substring.
    await expect(page.getByTestId('variable-enabled')).toContainText('true')
    await expect(page.getByTestId('variable-disabled')).toContainText('false')
    await expect(page.getByTestId('variable-default')).toContainText('true')
})
