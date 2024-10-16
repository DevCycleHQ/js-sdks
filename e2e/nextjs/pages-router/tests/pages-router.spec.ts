import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Pages Enabled Variable: true')).toBeVisible()
    await expect(page.getByText('Pages Disabled Variable: false')).toBeVisible()
})

test('self-targeting has expected page elements', async ({ page }) => {
    await page.goto('/self-targeting')

    await expect(page.getByText('Pages Enabled Variable: false')).toBeVisible()
    await expect(page.getByText('Pages Disabled Variable: true')).toBeVisible()
})
