import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    console.log('RUNNING TEST')
    await page.route(/.*sdkConfig.*/, async (route) => {
        console.log('INTERCEPTED CONFIG!')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        route.continue()
    })
    await page.goto('/')

    await expect(page.getByText('Server Variable')).toBeVisible()
    await expect(page.getByText('Client Variable')).toBeVisible()
    await expect(page.getByTestId('server-variable-value')).toContainText(
        'false',
    )
    await expect(page.getByTestId('client-variable-value')).toContainText(
        'false',
    )
    await expect(page.getByTestId('server-user-id')).toContainText(
        'server-user',
    )
    await expect(page.getByTestId('client-user-id')).toContainText(
        'server-user',
    )
})
