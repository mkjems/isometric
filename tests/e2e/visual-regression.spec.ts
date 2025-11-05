import { test, expect } from '@playwright/test';

test.describe('Isometric Game - Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500); // Wait for complete render
    });

    test('should match initial game state screenshot', async ({ page }) => {
        const canvas = await page.locator('#gameCanvas');

        // Take screenshot of canvas
        await expect(canvas).toHaveScreenshot('game-initial-state.png', {
            maxDiffPixels: 100, // Allow small differences for anti-aliasing
        });
    });

    test('should match full page layout', async ({ page }) => {
        await expect(page).toHaveScreenshot('full-game-page.png', {
            fullPage: true,
            maxDiffPixels: 100,
        });
    });
});
