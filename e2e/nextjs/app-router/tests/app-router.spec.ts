import { test, expect } from '@playwright/test'

test('has expected page elements when streaming mode', async ({ page }) => {
    await page.goto('/?enableStreaming=1')
    await expect(page.getByText('Streaming Enabled')).toBeVisible({
        timeout: 20000,
    })

    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()
})

test('has expected page elements', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Streaming Disabled')).toBeVisible({
        timeout: 20000,
    })

    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()
})
