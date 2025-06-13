/*
 * Copyright (C) con terra GmbH
 */
import { expect, Locator, Page } from "@playwright/test";

/**
 * Allows to test if a screenshot matches an expected screenshot using custom timeouts and intervals.
 */
export async function expectToMatchScreenshot(
    element: Page | Locator,
    screenshotName: string,
    options?: { timeout?: number, intervals?: number[] }
): Promise<void> {
    await expect(async () => {
        await expect(element).toHaveScreenshot(screenshotName);
    }).toPass({
        ... options
    });
}

/**
 * Waits until the div with the class "map__loading-info" is not loading anymore.
 */
export async function waitForMap(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => {
        const loadingInfo = document.querySelector(".map__loading-info");
        if (!loadingInfo) {
            return false;
        }
        return !loadingInfo.classList.contains("map__loading-info--is-loading");
    });
}
