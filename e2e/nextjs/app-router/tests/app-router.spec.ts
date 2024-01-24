import { test, expect } from '@playwright/test'

test('has expected page elements when streaming mode', async ({ page }) => {
    await page.goto('/streaming', {
        // wait until the page starts to render...
        waitUntil: 'commit',
    })
    await expect(page.getByText('Loading...')).toBeVisible()
    await expect(page.getByText('Streaming Enabled')).toBeVisible()

    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Server All Variables: .*"key":"enabled-feature","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Server All Features: .*"key":"enabled-feature","type":"permission"/,
        ),
    ).toBeVisible()

    await expect(
        page.getByText(
            /Client All Variables: .*"key":"enabled-feature","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Client All Features: .*"key":"enabled-feature","type":"permission"/,
        ),
    ).toBeVisible()
})

test('works after a client side navigation in streaming mode', async ({
    page,
}) => {
    await page.goto('/streaming')
    await expect(page.getByText('Streaming Enabled')).toBeVisible()

    await page.getByText('Go To page').click()
    await expect(page.getByText('Navigated Server Component')).toBeVisible()

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
    await page.goto('/normal')
    await expect(page.getByText('Streaming Disabled')).toBeVisible()

    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Server All Variables: .*"key":"enabled-feature","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Server All Features: .*"key":"enabled-feature","type":"permission"/,
        ),
    ).toBeVisible()

    await expect(
        page.getByText(
            /Client All Variables: .*"key":"enabled-feature","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Client All Features: .*"key":"enabled-feature","type":"permission"/,
        ),
    ).toBeVisible()

    await expect(
        page.getByText('Client Component Conditionally Bundled'),
    ).toBeVisible()
})

test('works after a client side navigation', async ({ page }) => {
    await page.goto('/normal')
    await expect(page.getByText('Streaming Disabled')).toBeVisible()
    await page.getByText('Go To page').click()
    await expect(page.getByText('Navigated Server Component')).toBeVisible()

    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()
})
