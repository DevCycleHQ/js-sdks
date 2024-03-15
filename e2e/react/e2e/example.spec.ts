import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
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
