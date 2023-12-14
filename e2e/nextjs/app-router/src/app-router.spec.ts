import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Server Variable: false')).toBeVisible()
    await expect(page.getByText('Client Variable: false')).toBeVisible()
})
