import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Pages Variable: false')).toBeVisible()
})
