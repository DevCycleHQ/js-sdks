import { test, expect } from '@playwright/test'

test('imports devcycle sdk and fetches variables', async ({ page }) => {
    await page.goto('/')
    await expect(
        page.getByText('variable enabled-feature = true'),
    ).toBeVisible()
    await expect(
        page.getByText('variable disabled-feature = false'),
    ).toBeVisible()
    await expect(
        page.getByText('variable default-feature = true'),
    ).toBeVisible()
})
