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

    // test server action flagging
    await page.getByText('Test Action').click()
    await expect(page.getByText('Client Action Result: true')).toBeVisible()
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

test('has expected page elements when obfuscated', async ({ page }) => {
    await page.goto('/obfuscated')
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
            /Server All Variables: .*"key":"dvc_obfs_0f647e752bcd0586b2844212f720d0f3c9f892431a9b6f6a4076bb4e4ee68a5e","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Server All Features: .*"key":"dvc_obfs_6553a2aa0a2db40ce71b5fa1ecba4773236249e1e3b1b2270507c6b819e256f8","type":"permission"/,
        ),
    ).toBeVisible()

    await expect(
        page.getByText(
            /Client All Variables: .*"key":"dvc_obfs_0f647e752bcd0586b2844212f720d0f3c9f892431a9b6f6a4076bb4e4ee68a5e","type":"Boolean"/,
        ),
    ).toBeVisible()
    await expect(
        page.getByText(
            /Client All Features: .*"key":"dvc_obfs_6553a2aa0a2db40ce71b5fa1ecba4773236249e1e3b1b2270507c6b819e256f8","type":"permission"/,
        ),
    ).toBeVisible()

    await expect(
        page.getByText('Client Component Conditionally Bundled'),
    ).toBeVisible()
})

test('self-targeting overrides the values', async ({ page }) => {
    await page.goto('/self-targeting')
    await expect(page.getByText('Server Enabled Variable: false')).toBeVisible()
    await expect(page.getByText('Client Enabled Variable: false')).toBeVisible()
    await expect(page.getByText('Server Disabled Variable: true')).toBeVisible()
    await expect(page.getByText('Client Disabled Variable: true')).toBeVisible()
})
