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
    // Wait for the client opt-in feature text to change to 'optin',
    // signaling that the opt-in has been applied client-side.
    await expect(
        page.getByText('OptIn Enabled Feature: "opt-in"'),
    ).toBeVisible()
    await switchButton.click()
    await savePreferencesButton.click()
    await expect(page.getByText('OptIn Enabled Feature: "on"')).toBeVisible()
})

test('optIn works with a user with existing opt-ins', async ({ page }) => {
    await page.setExtraHTTPHeaders({
        'x-test-user-id': 'optin-user-2',
    })
    await page.goto('/optin')
    await expect(page.getByText('OptIn Test Page')).toBeVisible()

    await expect(
        page.getByText('OptIn Enabled Feature: "opt-in"'),
    ).toBeVisible()
    await page.setExtraHTTPHeaders({})
})

test('server-side evaluation works correctly', async ({ page }) => {
    await page.goto('/server-eval')
    await expect(page.getByText('Server Evaluation Test')).toBeVisible()

    // Server-evaluated values
    await expect(page.getByText('Server Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Server Disabled Variable: false'),
    ).toBeVisible()

    // Client values should match server
    await expect(page.getByText('Client Enabled Variable: true')).toBeVisible()
    await expect(
        page.getByText('Client Disabled Variable: false'),
    ).toBeVisible()

    // Verify allVariables works
    await expect(
        page.getByText(
            /Server All Variables: .*"key":"enabled-feature","type":"Boolean"/,
        ),
    ).toBeVisible()

    // Verify allFeatures works
    await expect(
        page.getByText(
            /Server All Features: .*"key":"enabled-feature","type":"permission"/,
        ),
    ).toBeVisible()
})
