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

test('edgeDB uses EdgeDB data for feature targeting', async ({ page }) => {
    await page.goto('/edgedb')

    await expect(page.getByText('EdgeDB Test Page')).toBeVisible()
    await expect(page.getByText('Pages Enabled Variable: true')).toBeVisible()
    await expect(page.getByText('Pages Disabled Variable: false')).toBeVisible()

    // EdgeDB-targeted features (for user-1 with premium tier)
    await expect(page.getByText('Pages Premium Feature: true')).toBeVisible()
    await expect(page.getByText('Pages Registered Access: true')).toBeVisible()
})
