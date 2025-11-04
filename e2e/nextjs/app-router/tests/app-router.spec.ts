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

    await page.getByRole('link', { name: 'Go To page' }).click()
    // Increase timeout for navigation in CI
    await expect(page.getByText('Navigated Server Component')).toBeVisible({
        timeout: 10000,
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
    await expect(page.getByText('Server Function Result: true')).toBeVisible({
        timeout: 10000,
    })

    // test middleware flagging
    await expect(
        page.getByText('Middleware Enabled Feature: true'),
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

test('edgeDB uses EdgeDB data for feature targeting', async ({ page }) => {
    await page.goto('/edgedb')
    await expect(page.getByText('EdgeDB Test Page')).toBeVisible()

    // Baseline features should work
    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()

    // EdgeDB-targeted features (for user-1 with premium tier)
    await expect(page.getByText('Server Premium Feature: true')).toBeVisible()
    await expect(page.getByText('Server Registered Access: true')).toBeVisible()
    await expect(
        page.getByText('Server US Premium Feature: true'),
    ).toBeVisible()

    // Client-side should match
    await expect(page.getByText('Client Premium Feature: true')).toBeVisible()
    await expect(page.getByText('Client Registered Access: true')).toBeVisible()
})

test('optIn uses OptIn data for feature targeting', async ({ page }) => {
    await page.goto('/optin')
    await expect(page.getByText('OptIn Test Page')).toBeVisible()

    // test optin
    // click the switch button in the iframe to enable the opt-in
    const switchButton = page
        .frameLocator('iframe[data-dvc-widget="dvc-iframe"]')
        .getByRole('switch')
    await expect(switchButton).toHaveAttribute('aria-checked', 'false')
    await switchButton.click()
    const savePreferencesButton = page
        .frameLocator('iframe[data-dvc-widget="dvc-iframe"]')
        .getByRole('button', { name: 'Save Preferences' })
    await savePreferencesButton.click()
    // Wait for the client opt-in feature text to change to 'optin', signaling that the opt-in has been applied client-side.
    await expect(
        page.getByText('Client OptIn Enabled Feature: opt-in'),
    ).toBeVisible()
    await expect(
        page.getByText('Server OptIn Enabled Feature: opt-in'),
    ).toBeVisible()
    await switchButton.click()
    await savePreferencesButton.click()
    await expect(
        page.getByText('Client OptIn Enabled Feature: on'),
    ).toBeVisible()
    await expect(
        page.getByText('Server OptIn Enabled Feature: on'),
    ).toBeVisible()
})

test('optIn works with a user with existing opt-ins', async ({ page }) => {
    await page.setExtraHTTPHeaders({
        'x-test-user-id': 'optin-user-2',
    })
    await page.goto('/optin')
    await expect(page.getByText('OptIn Test Page')).toBeVisible()

    await expect(
        page.getByText('Client OptIn Enabled Feature: opt-in'),
    ).toBeVisible()
    await expect(
        page.getByText('Server OptIn Enabled Feature: opt-in'),
    ).toBeVisible()
    await page.setExtraHTTPHeaders({})
})
