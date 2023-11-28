import { defineConfig } from '@playwright/test'
import { nxE2EPreset } from '@nx/playwright/preset'

import { workspaceRoot } from '@nx/devkit'

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const nxConfig = nxE2EPreset(__filename, { testDir: './src' })

export default defineConfig({
    ...{
        ...nxConfig,
        // Only run the webkit browser.
        projects: nxConfig.projects.filter((p) => p.name === 'webkit'),
    },
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'yarn nx serve example-nextjs-app-router',
        url: 'http://127.0.0.1:4200',
        reuseExistingServer: !process.env.CI,
        cwd: workspaceRoot,
    },
})
