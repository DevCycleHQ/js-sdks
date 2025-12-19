import { defineConfig } from '@playwright/test'
import { nxE2EPreset } from '@nx/playwright/preset'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { workspaceRoot } from '@nx/devkit'

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
const config = nxE2EPreset(__filename, { testDir: './e2e' })
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    ...config,
    projects: config.projects.filter((p) => p.name === 'webkit'),
    reporter: [['html', { outputFolder: 'playwright-report' }]],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'yarn e2e:js-cdn:start',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        cwd: workspaceRoot,
    },
})
