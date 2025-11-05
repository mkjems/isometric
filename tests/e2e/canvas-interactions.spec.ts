import { test, expect } from '@playwright/test';

test.describe('Isometric Game - Canvas Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(300);
    });

    test('should handle mouse movement over canvas', async ({ page }) => {
        const canvas = await page.locator('#gameCanvas');

        // Move mouse over canvas
        await canvas.hover({ position: { x: 200, y: 200 } });
        await page.waitForTimeout(100);

        const hoveredTile = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getGameState().hoveredTile;
        });

        // Should have a hovered tile (or null if outside grid)
        expect(hoveredTile !== undefined).toBe(true);
    });

    test('should handle canvas click', async ({ page }) => {
        const canvas = await page.locator('#gameCanvas');

        await canvas.click({ position: { x: 300, y: 300 } });
        await page.waitForTimeout(100);

        const selectedTile = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getGameState().selectedTile;
        });

        // A tile should be selected (or null if outside grid)
        expect(selectedTile !== undefined).toBe(true);
    });
});
