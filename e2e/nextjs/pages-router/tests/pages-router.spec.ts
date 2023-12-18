import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Pages Enabled Variable: true')).toBeVisible()
    await expect(page.getByText('Pages Disabled Variable: false')).toBeVisible()
})
