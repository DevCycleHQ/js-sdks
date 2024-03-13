import { test, expect } from '@playwright/test'

test('should render with the correct variable names', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('variable-enabled')).toContainText('true')
    await expect(page.getByTestId('variable-disabled')).toContainText('false')
    await expect(page.getByTestId('variable-default')).toContainText('true')
})
