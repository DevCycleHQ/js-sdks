import { test, expect } from '@playwright/test'

test('has expected page elements', async ({ page }) => {
    console.log('RUNNING TEST')
    // await page.route(/.*sdkConfig.*/, async (route) => {
    //     console.log('INTERCEPTED CONFIG!')
    //     await new Promise((resolve) => setTimeout(resolve, 2000))
    //     route.continue()
    // })
    await page.goto('/')

    await expect(page.getByText('Server Variable: false')).toBeVisible()
    await expect(page.getByText('Client Variable: false')).toBeVisible()
})
