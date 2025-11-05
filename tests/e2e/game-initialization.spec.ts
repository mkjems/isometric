import { test, expect } from '@playwright/test';

test.describe('Isometric Game - Initialization', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load and display canvas', async ({ page }) => {
        const canvas = await page.locator('#gameCanvas');
        await expect(canvas).toBeVisible();

        // Check canvas dimensions
        const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
        const height = await canvas.evaluate((el: HTMLCanvasElement) => el.height);

        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
    });

    test('should render content on canvas', async ({ page }) => {
        await page.waitForTimeout(500); // Wait for initial render

        const hasContent = await page.evaluate(() => {
            const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
            if (!canvas) return false;

            const ctx = canvas.getContext('2d');
            if (!ctx) return false;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Check if any pixel is non-transparent
            for (let i = 3; i < imageData.data.length; i += 4) {
                if (imageData.data[i] > 0) return true;
            }
            return false;
        });

        expect(hasContent).toBe(true);
    });

    test('should initialize game state', async ({ page }) => {
        await page.waitForTimeout(300);

        const gameState = await page.evaluate(() => {
            const api = (window as any).__gameTestAPI;
            return api ? api.getGameState() : null;
        });

        expect(gameState).toBeTruthy();
        expect(gameState.gridSize).toBeGreaterThan(0);
    });

    test('should initialize player at starting position', async ({ page }) => {
        const playerPos = await page.evaluate(() => {
            const api = (window as any).__gameTestAPI;
            return api ? api.getPlayerPosition() : null;
        });

        expect(playerPos).toBeTruthy();
        expect(playerPos.row).toBeGreaterThanOrEqual(0);
        expect(playerPos.col).toBeGreaterThanOrEqual(0);
    });
});
