/*
 * Copyright (C) con terra GmbH
 */
import { Locator, Page } from "@playwright/test";
import { waitForMap } from "../common/testUtils";
import { Point, Rectangle } from "../api";

export class MapCanvas {
    readonly canvas: Locator;
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
        this.canvas = page.locator("canvas");
    }

    async clickOnMap(location: Point): Promise<void> {
        await this.canvas.click({ position: location });
    }

    async drawLine(from: Point, to: Point): Promise<void> {
        await this.canvas.click({ position: from });
        await this.canvas.dblclick({ position: to });
    }

    async drawRectangle(rectangle: Rectangle): Promise<void> {
        await this.page.mouse.move(rectangle.left, rectangle.top);
        await this.page.mouse.down();
        await this.page.waitForTimeout(100);
        await this.page.mouse.move(
            rectangle.left + rectangle.width,
            rectangle.top + rectangle.height
        );
        await this.page.mouse.up();
        await this.page.waitForTimeout(100);
    }

    async loaded(): Promise<void> {
        await waitForMap(this.page);
    }
}
