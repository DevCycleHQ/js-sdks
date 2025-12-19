import { defineConfig } from '@playwright/test'
import { nxE2EPreset } from '@nx/playwright/preset'

import { workspaceRoot } from '@nx/devkit'

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:3000'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const nxConfig = nxE2EPreset(__filename, { testDir: './tests' })

export default defineConfig({
    ...nxConfig,
    projects:
        nxConfig.projects?.filter((p) => p.name === 'webkit') ||
        [{ name: 'webkit', use: { browserName: 'webkit' } }],
    reporter: [['html', { outputFolder: 'playwright-report' }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'yarn e2e:js-esm:start',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        cwd: workspaceRoot,
    },
})
