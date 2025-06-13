/*
 * Copyright (C) con terra GmbH
 */
import {
    defineConfig,
    devices,
    PlaywrightTestConfig
} from "@playwright/test";
import { env } from "process";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const baseURL = env.BASE_URL || "http://localhost:9090";
const testDir = env.TESTS_DIR || "./src/test/end-to-end/test";
const outputDir = env.TARGET_DIR || "./target/playwright/output";

const isCI = !!env.CI;

const snapshotsFolder = env.SNAPSHOTS_DIR || "./src/test/end-to-end/test/snapshots/local";

const config: PlaywrightTestConfig = {
    testDir,
    outputDir: `${outputDir}/results`,

    snapshotPathTemplate: `${snapshotsFolder}/{testFileName}-snapshots/{arg}-{projectName}{ext}`,

    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Retry on CI only */
    retries: isCI ? 1 : 0,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,
    /* Opt out of parallel tests on CI. */
    workers: isCI ? 1 : 2,

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry"
    },

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        [
            "html",
            {
                outputFolder: `${outputDir}/reports/html`,
                open: isCI ? "never" : "always"
            }
        ],
        ["junit", { outputFile: `${outputDir}/reports/junit/results.xml` }]
    ],

    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.1,
            threshold: 0.05
        },
        // increased timeout (default is 5000)
        // pro: less flaky tests, no need to wait for network state
        // con: longer test duration where assertions are failing
        timeout: 30000
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "Desktop Chrome",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    // enable WEBGL for headless tests
                    args: isCI
                        ? ["--disable-gpu"]
                        : []
                },
                viewport: { width: 1920, height: 1080 }
            }
        }
    ],

    timeout: isCI ? 120000 : 30000
};
export default defineConfig(config);
